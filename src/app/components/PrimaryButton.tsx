interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: React.ReactNode;
  isLoading?: boolean;
}

export default function PrimaryButton({ label, isLoading, ...props }: Props) {
  return (
    <button
      disabled={isLoading}
      className="text-white font-semibold disabled:border-gray-100 disabled:bg-gray-100 inline-block py-3 px-10 text-sm bg-cyan-500 hover:bg-cyan-400 transition-colors duration-500 rounded-lg"
      {...props}
    >
      {label}
    </button>
  );
}
