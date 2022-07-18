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
import { UnionToIntersect } from "../utils/types";

export type ModalShowableInteraction =
  | BaseCommandInteraction
  | ContextMenuInteraction
  | MessageComponentInteraction;

export interface ModalStateType<T> {
  encode: (data: T) => string | Promise<string>;
  decode: (data: string) => T | Promise<T>;
}

export interface ModalStateField<N extends string, T> {
  name: N;
  type: ModalStateType<T>;
}

export interface ModalUserInputField<
  N extends Required<TextInputComponentOptions["customId"]>
> extends TextInputComponentOptions {
  customId: N;
  label: Required<TextInputComponentOptions["label"]>;
  style: Required<TextInputComponentOptions["style"]>;
}

export interface ModalResponse<
  SA extends S[] | null,
  S extends ModalStateField<SN, unknown>,
  SN extends string,
  IN extends string
> {
  interaction: ModalSubmitInteraction;
  state: SA extends S[]
    ? UnionToIntersect<
        SA extends SA
          ? Record<
              SA[number]["name"],
              SA[number]["type"] extends ModalStateType<infer I> ? I : never
            >
          : never
      >
    : null;
  userInput: UnionToIntersect<IN extends IN ? Record<IN, string> : never>;
}

export interface ModalOptions<
  SA extends S[] | null,
  S extends ModalStateField<SN, unknown>,
  SN extends string,
  IN extends string
> {
  id: string;
  defaultTitle: string;
  stateFields: SA;
  userInputFields: ModalUserInputField<IN>[];
  onSubmit: (response: ModalResponse<SA, S, SN, IN>) => void | Promise<void>;
}

export interface ModalShowOptions<
  SA extends S[] | null,
  S extends ModalStateField<SN, unknown>,
  SN extends string
> {
  interaction: ModalShowableInteraction;
  state: SA extends S[]
    ? UnionToIntersect<
        SA extends SA
          ? Record<
              SA[number]["name"],
              SA[number]["type"] extends ModalStateType<infer I> ? I : never
            >
          : never
      >
    : null;
  title?: string;
}

export class Modal<
  SA extends S[] | null,
  S extends ModalStateField<SN, any>, // eslint-disable-line
  SN extends string,
  IN extends string
> {
  constructor(private options: ModalOptions<SA, S, SN, IN>) {}

  async show({ interaction, state, title }: ModalShowOptions<SA, S, SN>) {
    const encodedStateFields = this.options.stateFields
      ? await Promise.all(
          this.options.stateFields.map(
            (field) => field.type.encode((state as any)[field.name]) // eslint-disable-line
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

    let decodedState: ModalResponse<SA, S, SN, IN>["state"];
    try {
      decodedState = (
        this.options.stateFields
          ? (Object.fromEntries(
              await Promise.all(
                this.options.stateFields.map(
                  async (field, index) =>
                    [
                      field.name,
                      await field.type.decode(encodedStateFields[index]),
                    ] as S extends S ? [S["name"], S["type"]] : never
                )
              )
            ) as ModalResponse<SA, S, SN, IN>["state"])
          : null
      ) as ModalResponse<SA, S, SN, IN>["state"];
    } catch (e) {
      return;
    }

    const userInput = Object.fromEntries(
      interaction.components.map((component) => [
        component.components[0].customId,
        component.components[0].value || undefined,
      ])
    ) as ModalResponse<SA, S, SN, IN>["userInput"];

    await this.options.onSubmit({
      interaction,
      state: decodedState,
      userInput,
    });
  }
}
