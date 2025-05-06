import type { FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import useSWR from "swr";
import FormSkeleton from "@/components/FormSkeleton";

interface User {
  id?: string;
  username: string;
  email: string;
}

async function fetcher(userId: string) {
  const { data, error } = await supabase
    .from("user")
    .select()
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

export default function UserEditForm({ userId }: { userId: string }) {
  const {
    data: user,
    error,
    isLoading,
    mutate,
  } = useSWR(userId ? `user?id=eq.${userId}` : null, () => fetcher(userId));

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const eventTarget = event.target as typeof event.target & {
      username: { value: string };
      email: { value: string };
    };

    const formData = {
      username: eventTarget.username.value,
      email: eventTarget.email.value,
    } as User;

    try {
      const { data: updatedUser } = await supabase
        .from("user")
        .update(formData)
        .eq("id", userId);

      mutate(updatedUser, false);
      window.location.href = "/users";
    } catch (error) {
      console.error(error);
    }
  };

  if (error) return <div>Error loading item details</div>;

  return isLoading ? (
    <FormSkeleton rows={2} />
  ) : (
    <form onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <fieldset>
          <label
            htmlFor="username"
            className="block font-bold mb-2 font-manrope"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            required
            defaultValue={user.username}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-cyan-100  focus:border-cyan-500"
          />
        </fieldset>
        <fieldset>
          <label
            htmlFor="email"
            className="block mb-2.5 font-manrope font-bold"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            defaultValue={user.email}
            required
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-cyan-100  focus:border-cyan-500"
          />
        </fieldset>
      </div>
      <footer className="mt-10">
        <a
          href="/admin/users"
          className="inline-block py-2 px-10 flex-grow font-semibold text-lg bg-white border-gray-200 border-[1px] rounded-md"
        >
          Cancel
        </a>
        <button
          type="submit"
          className="inline-block ml-4 py-2 px-10 flex-grow font-semibold text-lg bg-blue-500 text-white rounded-md"
        >
          Save
        </button>
      </footer>
    </form>
  );
}
