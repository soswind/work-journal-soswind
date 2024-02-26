import { Form, useLoaderData, useActionData } from "@remix-run/react";
import { getSession, commitSession } from "./session.server";
import { json, redirect } from "@remix-run/node";

export async function loader({ request }) {
    let session = await
    getSession(request.headers.get("cookie"));

    return session.data;
}

export default function LoginPage() {
    const data = useLoaderData();
    const actionData = useActionData();

    return (
        <div className="mx-auto mt-8 max-w-xs lg:max-w-sm">
            {data.isAdmin ? (
                <p>Du er logget ind!</p>
            ) : (
            <Form method="post">
            <div className="space-y-2">
            <input 
            className="w-full rounded-md border-gray-700 bg-gray-800 text-white focus:border-sky-600 focus:ring-sky-600"
            placeholder="email"
            name="email"
            type="emal"
            required
            />
            <input
            className="w-full rounded-md border-gray-700 bg-gray-800 
            text-white focus:border-sky-600 focus:ring-sky-600"
            placeholder="password"
            name="password"
            type="password"
            required
            />
            <div className="mt-8">
            <button className="w-full rounded-md bg-sky-600 px-3 py-2 
            font-medium text-white hover:bg-sky-500 focus:outline-none focus:ring-2 
            focus:ring-sky-600 focus:ring-offset-2 focus:ring-offset-gray-900">Log ind
            </button>
            {actionData?.error && (
                <p className="mt-4 font-medium text-red-500">{actionData.error}</p>
            
            )}
            </div>
            </div>
            </Form>
            )}
        </div>
    );
}

export async function action({ request }) {
    let formData = await request.formData();
    let { email, password } = Object.fromEntries(formData);
    
    if (email === "sos@mail.com" && password === "1234") {
        let session = await getSession();
        session.set("isAdmin", true);

        return redirect("/", {
        headers: {
            "Set-Cookie": await commitSession(session),
        },
    });
} else {
    let error;

    if (!email) {
        error = "Email is required.";
    } else if (!password) {
        error = "Password is required.";
    } else {
        error = "Invalid login.";
    }

    return json ({ error }, 401);
}
}