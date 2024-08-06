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