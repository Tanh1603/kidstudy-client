interface ErrorProps {
  message?: string;
}

export default function Error({ message = "An error occurred." }: ErrorProps) {
  return (
    <div className="flex items-center justify-center rounded-lg bg-red-50 p-4">
      <div className="flex items-center">
        <svg
          className="mr-2 h-6 w-6 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="font-medium text-red-700">{message}</p>
      </div>
    </div>
  );
}
