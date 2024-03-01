import { useLoaderData, Form } from "@remix-run/react";
import mongoose from "mongoose";
import EntryForm from "../components/entry.form";
import { redirect } from "@remix-run/node";
import { getSession } from "../session.server";
import { uploadImage } from "../upload-handler.server";


export async function loader({ params, request }) {
    if (typeof params.entryId !== "string") {
        throw new Response("Not found", { status: 404, statusText: "Not Found",
    });
    }

    const entry = await 
mongoose.models.Entry.findById(params.entryId)
.lean()
.exec();

if (!entry) {
    throw new Response("Not found", { status: 404, statusText: "Not Found",
});
}

const session = await getSession(request.headers.get("cookie"));
if (!session.data.isAdmin) {
    throw new Response("Not authenticated", { status: 401, statusText: "Not authenticated",
});
}


return {
    ...entry,
    date: entry.date.toISOString().substring(0, 10),
};
}


export async function action({ request, params }) {
    const session = await getSession(request.headers.get("cookie"));
    if (!session.data.isAdmin) {
        throw new Response("Not authenticated", { status: 401, statusText: "Not authenticated",
    });
    }

    if (typeof params.entryId !== "string") {
        throw new Response("Not found", { status: 404, statusText: "Not Found",
    });
    }

    const formData = await request.formData();
    const { _action, date, type, text, image } = Object.fromEntries(formData);
    // Artificially slow down the form submission to show pending UI
    if (_action === "delete") {

        await 

        mongoose.models.Entry.findByIdAndDelete(params.entryId);

        return redirect("/");
    } else {
        if (
            typeof date !== "string" ||
            typeof type !== "string" ||
            typeof text !== "string" ||
            !image

        ) {
            throw new Error("Bad request");
        }

        const entry = await 
        mongoose.models.Entry.findById(params.entryId);

        entry.date = new Date(formData.get("date"));
        entry.type = formData.get("type");
        entry.text = formData.get("text");

        if (image instanceof File) {
            const imageURL = await uploadImage(image);
            entry.image = imageURL;
        }

        await entry.save();

        return redirect("/");
    }
}

export default function EditPage() {
let entry = useLoaderData();

function handleSubmit(event) {
    if (!confirm("Er du sikker?")) {
        event.preventDefault();
    }
}

    return (
        <div className="mt-4">
      <div className="mb-8 rounded-lg border border-gray-700/30 bg-gray-800/50 p-4 lg:mb-20 lg:p-6">
        <p className="text-sm font-medium text-gray-500 lg:text-base">
          Rediger input
        </p>
        <EntryForm entry={entry} />
      </div>
    
            <div className="mt-8">
         <Form method="post" onSubmit={handleSubmit}>
            <button 
            name="_action"
            value="delete"
            className="text-gray-500 underline">
                Slet dette input...
            </button>
            </Form>
         </div>
         </div>

);
}

    // Mongoose will throw an error if the entry data is invalid (and we don't
    // catch it here, so it will be caught by Remix's error boundary and displayed
    // to the user — we can improve on that later)