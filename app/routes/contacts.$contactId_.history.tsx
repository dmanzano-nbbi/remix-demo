import { AgGridReact } from "ag-grid-react";
import AgGridStyles from "ag-grid-community/styles/ag-grid.css?url";
import AgThemeAlpineStyles from "ag-grid-community/styles/ag-theme-alpine.css?url";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { getContactHistory } from "~/data";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

export const loader = async({ params }: LoaderFunctionArgs) => {
  invariant(params.contactId, "Missing contactId param");
  const data = await getContactHistory(params.contactId);
  const contactHistory = data.map((item) => ({
    changeSummary: `Contact ${item.eventType}`,
    viewDetails: '',
    createdOn: item.date,
  }));

  return json({ contactHistory })
};

export default function ContactsHistory() {
  const { contactHistory} = useLoaderData<typeof loader>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columnDefinitions: any[] = [
    { field: "changeSummary" },
    { field: "viewDetails" },
    { field: "createdOn" },
  ];

  return (<div>
    Contact History

    <div
      className="ag-theme-quartz"
      style={{ height: 500 }}
    >
      <AgGridReact
          rowData={contactHistory}
          columnDefs={columnDefinitions}
      />
    </div>
  </div>);
}

export function links() {
  return [
    { rel: "stylesheet", href: AgGridStyles },
    { rel: "stylesheet", href: AgThemeAlpineStyles },
  ];
}