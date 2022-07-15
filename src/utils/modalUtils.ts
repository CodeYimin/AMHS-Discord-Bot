import {
  CommandInteraction,
  ContextMenuInteraction,
  MessageActionRow,
  MessageComponentInteraction,
  Modal,
  ModalSubmitInteraction,
  TextInputComponent,
  TextInputComponentOptions,
} from "discord.js";
import { generateUniqueId } from "./idGenerator";

export function createModal({
  customId,
  title,
  components,
}: {
  customId: string;
  title: string;
  components: readonly TextInputComponentOptions[];
}): Modal {
  const modal = new Modal().setCustomId(customId).setTitle(title);
  modal.addComponents(
    ...components.map(
      (component) =>
        new MessageActionRow<TextInputComponent>({
          components: [new TextInputComponent(component)],
        })
    )
  );
  return modal;
}

export function getModalResponseFieldValue(
  response: ModalSubmitInteraction,
  fieldCustomId: string
): string | undefined {
  for (const component of response.components) {
    if (component.components[0].customId === fieldCustomId) {
      return component.components[0].value;
    }
  }
}

export type UseModalComponentOption<T extends string> =
  TextInputComponentOptions &
    Required<Pick<TextInputComponentOptions, "style" | "label">> & {
      customId: T;
    };

export type ModalInitiatorInteraction =
  | CommandInteraction
  | ContextMenuInteraction
  | MessageComponentInteraction;

export interface UseModalOptions<T extends string> {
  components: readonly UseModalComponentOption<T>[];
  initiatorInteraction: ModalInitiatorInteraction;
  timeout?: number;
  title: string;
}

export interface UseModalResponse<T extends string> {
  interaction: ModalSubmitInteraction;
  fields: Record<T, string>;
}

export async function useModal<T extends string>({
  initiatorInteraction,
  title,
  timeout,
  components,
}: UseModalOptions<T>): Promise<UseModalResponse<T>> {
  const modal = createModal({
    title: title,
    customId: generateUniqueId(),
    components: components,
  });

  await initiatorInteraction.showModal(modal);
  const responseInteraction = await initiatorInteraction.awaitModalSubmit({
    filter: (interaction) => interaction.customId === modal.customId,
    time: timeout || 60e3 * 10,
  });

  const entries = responseInteraction.components.map((component) => [
    component.components[0].customId,
    component.components[0].value || undefined,
  ]);
  const fields = Object.fromEntries(entries) as Record<T, string>;

  return {
    interaction: responseInteraction,
    fields,
  };
}
