import {
  ActionRowBuilder,
  APITextInputComponent,
  CommandInteraction,
  MessageComponentInteraction,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
} from "discord.js";
import { Union } from "ts-toolbelt";
import { Optional } from "ts-toolbelt/out/Object/Optional";

export type ModalShowableInteraction =
  | CommandInteraction
  | MessageComponentInteraction;

export interface ModalStateType<T> {
  encode: (data: T) => string | Promise<string>;
  decode: (data: string) => T | Promise<T>;
}

export type StateField<T> = Record<string, ModalStateType<T>>;

export type State<T extends StateField<unknown> | undefined> =
  T extends undefined
    ? undefined
    : { [K in keyof T]: T[K] extends ModalStateType<infer I> ? I : never };

export interface ModalUserInputField<
  Id extends Required<APITextInputComponent["custom_id"]>
> extends Omit<APITextInputComponent, "custom_id"> {
  customId: Id;
  label: Required<APITextInputComponent["label"]>;
  style: Required<APITextInputComponent["style"]>;
}

export interface ModalResponse<
  U extends string,
  S extends StateField<unknown> | undefined
> {
  interaction: ModalSubmitInteraction;
  state: S extends undefined ? undefined : State<S>;
  userInput: Union.IntersectOf<U extends U ? Record<U, string> : never>;
}

export interface ModalOptions<
  U extends string,
  S extends StateField<unknown> | undefined
> {
  id: string;
  defaultTitle: string;
  stateFields?: S;
  userInputFields: ModalUserInputField<U>[];
  onSubmit: (response: ModalResponse<U, S>) => void | Promise<void>;
}

interface _ModalShowOptions<S extends StateField<unknown> | undefined> {
  interaction: ModalShowableInteraction;
  title?: string;
  state: State<S>;
}

export type ModalShowOptions<S extends StateField<unknown> | undefined> =
  S extends undefined
    ? Optional<_ModalShowOptions<S>, "state">
    : _ModalShowOptions<S>;

export class Modal<
  U extends string,
  S extends StateField<any> | undefined = undefined
> {
  constructor(private options: ModalOptions<U, S>) {}

  async show({ interaction, title, ...options }: ModalShowOptions<S>) {
    const encodedStateFields = this.options.stateFields
      ? await Promise.all(
          Object.entries(this.options.stateFields).map(([name, type]) =>
            type.encode(options.state![name])
          )
        )
      : [];

    const discordModal = new ModalBuilder({
      customId: this.options.id + ";" + encodedStateFields.join(";"),
      title: title || this.options.defaultTitle,
      components: this.options.userInputFields.map(
        (field) =>
          new ActionRowBuilder<TextInputBuilder>({
            components: [new TextInputBuilder(field)],
          })
      ),
    });

    await interaction.showModal(discordModal);
  }

  async processInteraction(interaction: ModalSubmitInteraction) {
    const customIdParts = interaction.customId.split(";");
    const id = customIdParts[0];
    const encodedStateFields = customIdParts.slice(1);

    if (id !== this.options.id) {
      return;
    }

    let decodedState: ModalResponse<U, S>["state"];
    if (this.options.stateFields) {
      try {
        /* eslint-disable */
        decodedState = Object.fromEntries(
          await Promise.all(
            Object.entries(this.options.stateFields).map(
              async ([name, type], index) => [
                name,
                await type.decode(encodedStateFields[index]),
              ]
            )
          )
        );
        /* eslint-enable */
      } catch (_) {
        return;
      }
    } else {
      decodedState = undefined as ModalResponse<U, S>["state"];
    }

    const userInput = Object.fromEntries(
      this.options.userInputFields.map((field) => [
        field.customId,
        interaction.fields.getTextInputValue(field.customId),
      ])
    ) as ModalResponse<U, S>["userInput"];

    await this.options.onSubmit({
      interaction,
      state: decodedState,
      userInput,
    });
  }
}
