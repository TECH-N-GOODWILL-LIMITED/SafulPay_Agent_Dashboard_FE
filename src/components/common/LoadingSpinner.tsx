interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  text = "Loading...",
  className = "",
}) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <div
      className={`flex items-center justify-center min-h-[400px] ${className}`}
    >
      <div className="flex flex-col items-center space-y-4">
        <div
          className={`animate-spin rounded-full border-b-2 border-brand-500 ${sizeClasses[size]}`}
        ></div>
        {text && (
          <p className="text-gray-600 dark:text-gray-400 text-sm">{text}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
