import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ServerErrorProps {
  onRetry?: () => void;
}

const ServerError = ({ onRetry }: ServerErrorProps) => {
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
          <div className="text-6xl font-bold text-red-600 mb-4">500</div>
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Internal Server Error</h1>
          <p className="text-gray-600 mb-6">
            An unexpected error occurred. Please try again. If the problem persists, contact support.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {onRetry && (
              <Button onClick={onRetry} className="flex items-center">
                <RefreshCcw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
            <Button asChild variant="outline" className="flex items-center">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ServerError;
