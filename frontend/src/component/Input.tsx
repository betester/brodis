
import { FC } from "react"
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input
} from "@chakra-ui/react"

interface InputProps {
  label: string
  id : string
  placeholder? : string
  isRequired?: boolean
  isValid?: boolean
  helperText?: string
  errorMessage?: string
  value: any
  variant? : string
  type? : string
  onChange: (arg: any) => any
}

export const ChakraInput : FC<InputProps> = (props) => {
  return (
    <FormControl variant={props.variant} id={props.id}>
      <FormLabel>{props.label}</FormLabel>
      <Input placeholder={props.placeholder} type={props.type} onChange={props.onChange} />
    </FormControl>
  )
}
