## How does routing work
- By default remix uses file based routing with a root route.
- The root route lives in the folder app while the routes will live within the routes directory of the app.
- Filename will map to route's url pathname except for `_index.tsx`
- Adding `.` to a route filename will create a `/` in the url
- Adding `$` to a route filename will create a path parameter
- Adding `_` to a route allows us to opt out of the default nesting

Example
```
app/
root.tsx

app/routes
- _index.tsx
- contacts.$contactId_.edit.tsx
- contacts.$contactId.destroy.tsx
- contacts.$contactId.tsx
```


## How is fetching performed?
Two APIs are used to load data: loader and `useLoaderData`
	- `loader`: this is where data will be fetched and formatted
	- `useLoaderData`: this allows us to retrieve the data defined by the loader

Example
```
// define a loader
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return json({ contacts, q });
};

// use loader
const { contacts, q } = useLoaderData<typeof loader>();
```

## How does form submission work?
Remix uses a the concept of routes and actions to handle submission. This means you will define an action method within a given file (route).

Example for updating contact
```
// write update action
export const action = async ({ params, request }: ActionFunctionArgs) => {
  invariant(params.contactId, "Missing contactId param");
  const formData = await request.formData();
  return updateContact(params.contactId, {
    favorite: formData.get("favorite") === "true",
  });
};

export default function Contact() {
...some code...
<Form action="Edit">
	<button type="Submit">Edit</button>
</Form>
```

## What if I want to delete an item?
In order to perform a delete we will need to
- Create a file as this will act as our route
- Export an action method within our newly created file. The method will house the deletion functionality.
- Within our original contact component we will create a new form and button to direct us to the delete method. The action will allow us to specify the file to look for

Example for deleting a contact
```
// File: contacts.$.contactId.destroy.tsx
export const action = async ({ params }: ActionFunctionArgs) => {
  invariant(params.contactId, "Missing contactId param");
  await deleteContact(params.contactId);
  return redirect("/");
};

// File: contacts.$contactId.tsx
<Form
	action="destroy"
	method="post"
	onSubmit={(event) => {
	  const confirmMessage = "Please confirm you want to delete this record.";
	  const response = confirm(confirmMessage);

	  if (!response) {
		event.preventDefault();
	  }
	}}
>
	<button type="submit">Delete</button>
</Form>
```

## How do I validate a form?
Remix doesn't provide a nice error format but it does have a nice way to introduce errors. We'll need to perform the following steps
- Import `useActionData` API. This will allow us to reference potential errors
- Within `action` method create an errors variable and populate this with the fields that need to be validated.
- If we have any errors return them `return json({errors});`
- Using the `actionData?.errors` to display any error
Example
```
import type { ActionFunctionArgs } from "@remix-run/node"; // or cloudflare/deno
import { json, redirect } from "@remix-run/node"; // or cloudflare/deno
import { Form, useActionData } from "@remix-run/react";

export default function Signup() {
  const actionData = useActionData<typeof action>();

  return (
    <Form method="post">
      <p>
        <input type="email" name="email" />
        {actionData?.errors?.email ? (
          <em>{actionData?.errors.email}</em>
        ) : null}
      </p>

      <p>
        <input type="password" name="password" />
        {actionData?.errors?.password ? (
          <em>{actionData?.errors.password}</em>
        ) : null}
      </p>

      <button type="submit">Sign Up</button>
    </Form>
  );
}

export async function action({
  request,
}: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const errors = {};

  if (!email.includes("@")) {
    errors.email = "Invalid email address";
  }

  if (password.length < 12) {
    errors.password =
      "Password should be at least 12 characters";
  }

  if (Object.keys(errors).length > 0) {
    return json({ errors });
  }

  // Redirect to dashboard if validation is successful
  return redirect("/dashboard");
}

```

## Validation with Remix Forms

Link to Remix Forms Docs: https://remix-forms.seasoned.cc/get-started

Create your formAction function
/app/form-action.server.ts
```
import { createFormAction } from 'remix-forms'
// For Remix, import it like this
import { redirect, json } from '@remix-run/node'

const formAction = createFormAction({ redirect, json })

export { formAction }
```

Create your Form component
/app/form.ts
```
import { createForm } from 'remix-forms'
// For Remix, import it like this
import { Form as FrameworkForm, useActionData, useSubmit, useNavigation } from '@remix-run/react'

const Form = createForm({ component: FrameworkForm, useNavigation, useSubmit, useActionData })

export { Form }
```

Write your schema
Compose a zod schema that will be used in your action, mutation function, form generation, server-side validation, and client-side validation.

```
import { z } from 'zod'

const schema = z.object({
  firstName: z.string().min(1),
  email: z.string().min(1).email(),
})
```

Create your mutation
Create a mutation function using Domain Functions' makeDomainFunction. It's a function that receives the values from the form and performs the necessary mutations, such as storing data on a database.

Domain Functions will parse the request's formData and perform the mutation only if everything is valid. If something goes bad, it will return structured error messages for us.

```
import { makeDomainFunction } from 'domain-functions'

const mutation = makeDomainFunction(schema)(async (values) => (
  console.log(values) /* or anything else, like saveMyValues(values) */
))
```

Create your action
If the mutation is successful, formAction will redirect to successPath. If not, it will return errors and values to pass to Form.

```
import { formAction } from '~/form-action.server' /* path to your custom formAction */

export const action: ActionFunction = async ({ request }) =>
  formAction({
    request,
    schema,
    mutation,
    successPath: '/success', /* path to redirect on success */
  })
```

Create a basic form
If you don't want any custom UI in the form, you can render Form without children and it will generate all the inputs, labels, error messages and button for you.

```
import { Form } from '~/form' /* path to your custom Form */

export default () => <Form schema={schema} />
```

For the example in this repo, we utilized the CSS Framework Tailwind to style the comoponents, as well as added custom messages to the validation error labels
