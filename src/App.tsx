import { Toaster } from "sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import routes from "./routes"
import NotFound from "./pages/NotFound"
import ServerError from "./pages/ServerError"
import ErrorBoundary from "./components/common/ErrorBoundary"
import "./App.css"
import { LanguageProvider } from "./contexts/LanguageContext"
import AuthProvider from "./hooks/useAuth"
import { BrowserRouter, Route, Routes } from "react-router-dom"

const queryClient = new QueryClient()

function App() {
  console.log('🚀 App component rendering...')

  try {
    console.log('📋 Routes loaded:', routes.length)
    console.log('🔧 QueryClient created')

    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <LanguageProvider>
            <BrowserRouter>
              <AuthProvider>
                <ErrorBoundary>
                  <Routes>
                    {routes.map((route, index) => (
                      <Route key={index} path={route.path} element={route.element} />
                    ))}
                    <Route path="/500" element={<ServerError />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </ErrorBoundary>
                <Toaster />
              </AuthProvider>
            </BrowserRouter>
          </LanguageProvider>
        </TooltipProvider>
      </QueryClientProvider>
    )
  } catch (error) {
    console.error('❌ Critical error in App component:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : ''
    return (
      <div style={{ padding: '20px', background: 'red', color: 'white' }}>
        <h1>Erreur critique dans l'application</h1>
        <p>{errorMessage}</p>
        <pre>{errorStack}</pre>
      </div>
    )
  }
}

export default App