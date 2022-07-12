import { ArgsOf, Client, Discord, On } from "discordx";
import { prismaInstance } from "../database/prisma";

@Discord()
class MessageLogger {
  @On("messageCreate")
  async messageCreate([message]: ArgsOf<"messageCreate">, client: Client) {
    await prismaInstance.message.create({
      data: {
        id: message.id,
        content: message.content,
      },
    });
  }
}
