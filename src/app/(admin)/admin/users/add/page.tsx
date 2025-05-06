// import { supabase } from "@/lib/supabase";
// import { UserType } from "@/types/userType";
import Link from "next/link";

export default async function Page() {
  // async function insertData(data: UserType) {
  //   const { error } = await supabase.from("user").insert([data]);
  //   if (error) {
  //     console.error("Error inserting data:", error);
  //     return { success: false, error: error.message };
  //   }
  //   return { success: true };
  // }

  // let insertResult;

  //   const formData = await Astro.request.formData();
  //   const newUser: User = {
  //     username: formData.get("username") as string,
  //     email: formData.get("email") as string,
  //     password: formData.get("password") as string,
  //   };

  //   insertResult = await insertData(newUser);

  return (
    <>
      <h1 className="mb-8 font-semibold text-lg block">Agregar Usuario</h1>
      <form method="post" action="/admin/users/add">
        <div className="flex flex-col gap-4">
          <fieldset>
            <label htmlFor="username" className="inline-block mb-2 text-sm">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              required
              className="bg-white w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-cyan-100  focus:border-cyan-500"
            />
          </fieldset>
          <fieldset>
            <label htmlFor="email" className="inline-block mb-2 text-sm">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="bg-white w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-cyan-100  focus:border-cyan-500"
            />
          </fieldset>
          <fieldset>
            <label htmlFor="password" className="inline-block mb-2 text-sm">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="bg-white w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-cyan-100  focus:border-cyan-500"
            />
          </fieldset>
        </div>
        {/* {insertResult?.success && (
          <div
            className="bg-green-200 bg-opacity-40 text-sm p-4 mt-6 rounded-md text-green-950"
            role="alert"
          >
            User was added successfully!
          </div>
        )} */}
        {/* {insertResult?.error && (
          <div
            className="bg-red-300 bg-opacity-40 text-sm p-4 mt-6 rounded-md text-red-950"
            role="alert"
          >
            There was an error creating the user: {insertResult.error}
          </div>
        )} */}
        <footer className="mt-10 gap-3 flex items-center">
          <Link
            href="/admin/users"
            title="Usuarios"
            className="font-semibold disabled:border-gray-100 disabled:bg-gray-100 inline-block py-3 px-10 bg-white text-sm border border-gray-100 rounded-lg transition-colors hover:border-gray-200 duration-500 active:border-gray-300"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="text-white font-semibold disabled:border-gray-100 disabled:bg-gray-100 inline-block py-3 px-10 text-sm bg-cyan-500 hover:bg-cyan-400 transition-colors duration-500 rounded-lg"
          >
            Guardar
          </button>
        </footer>
      </form>
    </>
  );
}
