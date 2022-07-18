import {
  BaseCommandInteraction,
  ContextMenuInteraction,
  MessageActionRow,
  MessageComponentInteraction,
  Modal as DiscordModal,
  ModalSubmitInteraction,
  TextInputComponent,
  TextInputComponentOptions,
} from "discord.js";
import { Union } from "ts-toolbelt";
import { Optional } from "ts-toolbelt/out/Object/Optional";

export type ModalShowableInteraction =
  | BaseCommandInteraction
  | ContextMenuInteraction
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
  Id extends Required<TextInputComponentOptions["customId"]>
> extends TextInputComponentOptions {
  customId: Id;
  label: Required<TextInputComponentOptions["label"]>;
  style: Required<TextInputComponentOptions["style"]>;
}

export interface ModalResponse<
  U extends string,
  S extends StateField<unknown> | undefined
> {
  interaction: ModalSubmitInteraction;
  state: S extends undefined
    ? undefined
    : { [K in keyof S]: S[K] extends ModalStateType<infer I> ? I : never };
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

export interface _ModalShowOptions<S extends StateField<unknown> | undefined> {
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
  S extends Record<string, ModalStateType<any>> | undefined = undefined // eslint-disable-line
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

    const discordModal = new DiscordModal({
      customId: this.options.id + ";" + encodedStateFields.join(";"),
      title: title || this.options.defaultTitle,
      components: this.options.userInputFields.map(
        (field) =>
          new MessageActionRow<TextInputComponent>({
            components: [new TextInputComponent(field)],
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
      interaction.components.map((component) => [
        component.components[0].customId,
        component.components[0].value || undefined,
      ])
    ) as ModalResponse<U, S>["userInput"];

    await this.options.onSubmit({
      interaction,
      state: decodedState,
      userInput,
    });
  }
}
