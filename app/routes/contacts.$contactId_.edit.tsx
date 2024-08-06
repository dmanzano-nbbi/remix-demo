import type {
  ActionFunctionArgs,
  LoaderFunctionArgs
} from "@remix-run/node";
import { json, redirect  } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import { getContact, updateContact } from "../data";

export const loader = async ({params, }: LoaderFunctionArgs) => {
  invariant(params.contactId, "Missing contactId param");
  const contact = await getContact(params.contactId);
  if (!contact) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ contact });
};

export const action = async ({ params, request, }: ActionFunctionArgs) => {
  invariant(params.contactId, "Missing contactId param");
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);
  const person = {
    first: String(formData.get("first")),
    last: String(formData.get("last")),
  };
  const errors = { first: "", last: "", };

  if (person.first.length === 0) {
    errors.first = "First name is required";
  }

  if (person.last.length === 0) {
    errors.last = "Last name is required";
  }

  if(Object.entries(errors).some(([k, v]) => (k !== "" && v !== ""))) {
    console.log(errors);
    return json({ errors });
  }


  await updateContact(params.contactId, updates);
  return redirect(`/contacts/${params.contactId}`);
};

export default function EditContact() {
  const { contact } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const actionData = useActionData<typeof action>();

  return (
    <Form key={contact.id} id="contact-form" method="post">
      <p>
        <span>Name</span>
        <input
          defaultValue={contact.first}
          aria-label="First name"
          name="first"
          type="text"
          placeholder="First"
        />
        {actionData?.errors?.first && (<em>{actionData?.errors?.first}</em>)}
        <input
          aria-label="Last name"
          defaultValue={contact.last}
          name="last"
          placeholder="Last"
          type="text"
        />
        {actionData?.errors?.last && (<em>{actionData?.errors?.last}</em>)}
      </p>
      <label>
        <span>Twitter</span>
        <input
          defaultValue={contact.twitter}
          name="twitter"
          placeholder="@jack"
          type="text"
        />
      </label>
      <label>
        <span>Avatar URL</span>
        <input
          aria-label="Avatar URL"
          defaultValue={contact.avatar}
          name="avatar"
          placeholder="https://example.com/avatar.jpg"
          type="text"
        />
      </label>
      <label>
        <span>Notes</span>
        <textarea
          defaultValue={contact.notes}
          name="notes"
          rows={6}
        />
      </label>
      <p>
        <button type="submit">Save</button>
        <button type="button" onClick={() => navigate(-1) }>Cancel</button>
      </p>
    </Form>
  );
}
