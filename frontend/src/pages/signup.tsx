import { signUp } from "@/service";
import { Text, VStack, Button } from "@chakra-ui/react";
import React, { useState } from "react";
import { useToast } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { ISignUp } from "@/models";
import { ChakraInput } from "@/component";
import NextLink from "next/link";
import { Link } from "@chakra-ui/react";

export default function SignUp() {
  const [value, setValue] = useState<ISignUp>({
    email: "",
    password: "",
    username: "",
  });
  const router = useRouter();
  const toast = useToast();

  const handleOnChange = (e: React.FormEvent<HTMLInputElement>) => {
    setValue({ ...value, [e.currentTarget.id]: e.currentTarget.value });
  };

  const onSubmit = async () => {
    const session = await signUp(value);

    if (!session) {
      toast({
        position: "top",
        title: `Whoops`,
        description: "Something went wrong, please try again",
        status: "error",
        isClosable: true,
      });
    } else {
      toast({
        position: "top",
        title: `Success`,
        description: "Redirecting in 3 seconds",
        status: "success",
        isClosable: true,
      });

      setTimeout(() => {
        router.replace("/login");
      }, 3000);
    }
  };

  return (
    <VStack h="100vh" justifyContent={"center"} gap="2em">
      <Text fontWeight={"bold"} fontSize={"4xl"}>
        Sign Up
      </Text>
      <VStack w={"40%"} gap={"1em"}>
        <ChakraInput
          label={"Email"}
          id={"email"}
          type="email"
          value={value.email}
          onChange={handleOnChange}
        />
        <ChakraInput
          label={"Username"}
          type="text"
          id={"username"}
          value={value.password}
          onChange={handleOnChange}
        />
        <ChakraInput
          label={"Password"}
          type="password"
          id={"password"}
          value={value.password}
          onChange={handleOnChange}
        />
        <Button
          minW={"100px"}
          alignSelf={"end"}
          bgColor={"blue.500"}
          onClick={onSubmit}
        >
          Sign Up
        </Button>
        <Text>
          Already have account?{" "}
          <Link color={"blue.200"} as={NextLink} href={"/login"}>
            Login
          </Link>
        </Text>
      </VStack>
    </VStack>
  );
}
