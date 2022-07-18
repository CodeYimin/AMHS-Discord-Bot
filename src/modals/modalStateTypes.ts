import { User } from "@prisma/client";
import { prisma } from "../database/prisma";
import { ModalStateType } from "./modal";

export function StringModalStateType(): ModalStateType<string> {
  return {
    encode: (data) => data,
    decode: (data) => data,
  };
}

export function NumberModalStateType(): ModalStateType<number> {
  return {
    encode: (data) => data.toString(),
    decode: (data) => {
      const number = parseFloat(data);
      if (isNaN(number)) {
        throw new Error(
          "NumberModalStateType: Encoded string is not a number."
        );
      }
      return number;
    },
  };
}

export function UserModalStateType(): ModalStateType<User> {
  return {
    encode: (data) => data.id,
    decode: async (data) => {
      const user = await prisma.user.findUnique({ where: { id: data } });
      if (!user) {
        throw new Error(
          "UserModalStateType: Encoded string is not a valid user id."
        );
      }
      return user;
    },
  };
}
