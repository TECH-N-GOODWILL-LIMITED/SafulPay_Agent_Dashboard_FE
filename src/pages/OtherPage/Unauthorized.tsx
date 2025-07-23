import Button from "../../components/ui/button/Button";

const Unauthorized: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen m-0 font-sans text-center bg-gray-50 text-gray-800">
      <div className="p-8">
        <h1 className="mb-4 text-4xl font-bold">Access Denied</h1>
        <p className="mb-8 text-lg text-gray-600">
          You do not have permission to view this page.
        </p>
        <Button to="/" size="sm">
          Back to Home Page
        </Button>
        <footer className="mt-16 text-gray-500 text-sm">
          <p>© - SafulPay's Agency Dashboard</p>
        </footer>
      </div>
    </div>
  );
};

export default Unauthorized;
