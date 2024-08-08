import type {
  ActionFunction,
} from '@remix-run/node'
import { z } from 'zod'
import Form from '~/ui/form'
import { makeDomainFunction } from 'domain-functions'
import { formAction } from '~/formAction'

const schema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    howYouFoundOutAboutUs: z.enum(['fromAFriend', 'google']).default('google'),
    notes: z.string().optional(),
})
  
const mutation = makeDomainFunction(schema)(async (values) => values)

export const action: ActionFunction = async ({ request }) =>
formAction({
    request,
    schema,
    mutation,
    successPath: '/',
})

export default function Component() {
    return (
        <Form schema={schema}>
            {({ Field, Errors, Button }) => (
            <>
                <Field name="firstName" />
                <Field name="lastName" />
                <Field name="email" />
                <Field name="howYouFoundOutAboutUs" />
                <Field name="notes" />
                <Errors />
                <div className="flex items-center space-x-4">
                <Button />
                </div>
            </>
            )}
        </Form>
    )
}