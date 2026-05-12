import { routes } from "@/lib/routes"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import Link from "next/link"
import { Controller } from "react-hook-form"

export function TermCheckbox({ form }: any) {
  return (
    <Controller
      name="agreed"
      control={form.control}
      render={({ field }) => (
        <FieldGroup className="w-full gap-2 px-4 md:px-12">
          <Field orientation="horizontal" className="">
            <Checkbox
              checked={field.value}
              onCheckedChange={(v) => field.onChange(v === true)}
            />
            <FieldLabel className="line-clamp-2 text-xs font-normal">
              I agree to the{" "}
              <Link href={routes.term} target="_blank" className="underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href={routes.privacy} target="_blank" className="underline">
                Privacy Policy
              </Link>
            </FieldLabel>
          </Field>
          {form.formState.errors.agreed && (
            <FieldError
              className="text-xs"
              errors={[form.formState.errors.agreed]}
            />
          )}
        </FieldGroup>
      )}
    />
  )
}
