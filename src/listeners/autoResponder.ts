import { NotBot } from "@discordx/utilities";
import { ArgsOf, Discord, Guard, On } from "discordx";
import { prisma } from "../database/prisma";

@Discord()
class AutoResponder {
  @On("messageCreate")
  @Guard(NotBot)
  async autoResponder([message]: ArgsOf<"messageCreate">) {
    const autoResponders = await prisma.autoResponder.findMany();
    const matchingAutoResponders = autoResponders.filter((responder) =>
      new RegExp(responder.triggerRegex).test(message.content)
    );
    await Promise.all(
      matchingAutoResponders.map((responder) =>
        message.channel.send(responder.response)
      )
    );
  }
}
