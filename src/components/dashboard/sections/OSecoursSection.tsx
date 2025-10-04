import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import TokenPurchase from "@/components/tokens/TokenPurchase";
import { useMembership } from "@/hooks/useMembership";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  PlusCircle,
  Zap,
  HelpCircle,
  ShieldCheck,
  Star,
  Calendar,
  Phone,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// Types
type Service = {
  id: string;
  name: string;
  description: string | null;
  price?: number; // Ajoute ce champ si tu veux gérer le prix côté table
  icon?: string;
  color?: string;
};

type TokenBalance = {
  tokenId: string;
  balance: number;
  usedThisMonth: number;
  monthlyLimit: number;
  remainingBalance: number;
  service: Service;
};

type Transaction = {
  service: String;
  id: string;
  date: string;
  type: "purchase" | "debit" | "credit" | "usage";
  tokenId: string;
  amount: number;
  totalPrice: number;
  status: "confirmed" | "pending" | "failed";
};

type ServiceRequest = {
  id: string;
  service: string;
  description: string;
  amount: number;
  provider: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  requestDate: string;
  estimatedCompletion?: string;
  type : string
};

export const MIN_PURCHASE_PER_SERVICE = 10;
export const MAX_MONTHLY_PURCHASE_PER_SERVICE = 60;

const OSecoursSection = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [activeTab, setActiveTab] = useState("services");
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [purchaseAmount, setPurchaseAmount] = useState(
    MIN_PURCHASE_PER_SERVICE.toString()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestServiceId, setRequestServiceId] = useState<string>("");
  const [requestTokens, setRequestTokens] = useState<string>("1");
  const [requestDescription, setRequestDescription] = useState<string>("");
const [fileType, setFileType] = useState<"image" | "pdf">("image");
  const [requestFile, setRequestFile] = useState<File | null>(null);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const { user } = useAuth();
  const { membership } = useMembership();
  const { t } = useLanguage();

  // Récupérer les services, balances, transactions, demandes
  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Services
      const { data: servicesData, error: servicesError } = await supabase
        .from("osecours_services")
        .select("*");
      if (servicesError) throw servicesError;
      setServices(servicesData || []);
      console.log("setServices", servicesData);

      // 2. Balances
      const { data: balancesData, error: balancesError } = await supabase
        .from("osecours_token_balances")
        .select("*, service:osecours_services(*)")
        .eq("user_id", user.id);
      if (balancesError) throw balancesError;
      console.log("Balances", balancesData);

      // 3. Transactions
      const { data: txData, error: txError } = await supabase
        .from("osecours_transactions")
        .select("*, service:osecours_services(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (txError) throw txError;
      console.log("Transactions", txData);

      // 4. Requests
      const { data: reqData, error: reqError } = await supabase
        .from("osecours_requests")
        .select("*, service:osecours_services(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (reqError) throw reqError;
      console.log("Requests", reqData);

      // Calculer l'utilisation mensuelle
      const startOfMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      ).getTime();
      const usedByType: Record<string, number> = {};
      (txData || []).forEach((tx) => {
        const tstamp = new Date(tx.created_at).getTime();
        if (
          tstamp >= startOfMonth &&
          tx.type === "purchase" &&
          tx.status === "confirmed"
        ) {
          usedByType[tx.service_id] =
            (usedByType[tx.service_id] || 0) + (tx.amount || 0);
        }
      }); // ANALYSE BIEN CETTE PARTIE POUR COMPRENDRE
console.log("usedByType", usedByType);
      setTokenBalances(
        (balancesData || []).map((b) => ({
          tokenId: b.service_id,
          balance: b.balance,
          usedThisMonth: usedByType[b.service_id] || 0,
          monthlyLimit: MAX_MONTHLY_PURCHASE_PER_SERVICE,
          remainingBalance: b.balance - (usedByType[b.service_id] || 0),
          service: b.service,
        }))
      );
      console.log("setTokenBalances", tokenBalances);

      setTransactions(
        (txData || []).map((tx) => ({
          id: tx.id,
          date: tx.created_at,
          type: tx.type,
          tokenId: tx.service_id,
          amount: tx.amount,
          totalPrice: 0, // À calculer si tu veux afficher le prix
          status: tx.status,
           service : tx.service?.name || "service Token"
        }))
      );

      setServiceRequests(
        (reqData || []).map((r) => ({
          id: r.id,
          service: r.service?.name || "",
          description: r.description,
          amount: r.amount  , // À adapter si tu stockes le montant
          provider: "El verra Global",
          status: r.status,
          requestDate: r.created_at,
          type : r.kind
          // estimatedCompletion: undefined,
        }))
      );

      // Sélectionner le premier token par défaut
      if ((balancesData || []).length > 0 && !selectedToken) {
        setSelectedToken(balancesData[1].service_id);
      }
    } catch (err: any) {
      setError(t("error_fetch_data"));
      toast.error(t("error_fetch_data"));
    } finally {
      setLoading(false);
    }
  }, [user?.id, t, selectedToken]);

  useEffect(() => {
    if (user?.id) fetchData();
  }, [user?.id, fetchData]);

  // Helpers
  const getTokenUsage = useCallback(
    (tokenId: string): number => {
      const balance = tokenBalances.find((b) => b.tokenId === tokenId);
      return balance ? balance.usedThisMonth : 0;
    },
    [tokenBalances]
  );

  const getRemainingTokens = useCallback(
    (tokenId: string) => {
      const used = getTokenUsage(tokenId);
      return Math.max(0, MAX_MONTHLY_PURCHASE_PER_SERVICE - used);
    },
    [getTokenUsage]
  );

  const getTokenBalance = useCallback(
    (tokenId: string): number => {
      const balance = tokenBalances.find((b) => b.tokenId === tokenId);
      return balance ? balance.balance : 0;
    },
    [tokenBalances]
  );

  const getStatusBadge = useCallback(
    (status: string) => {
      switch (status) {
        case "completed":
          return (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              {t("completed")}
            </Badge>
          );
        case "in_progress":
          return (
            <Badge className="bg-blue-100 text-blue-800">
              <Clock className="h-3 w-3 mr-1" />
              {t("in_progress")}
            </Badge>
          );
        case "pending":
          return (
            <Badge className="bg-yellow-100 text-yellow-800">
              <AlertCircle className="h-3 w-3 mr-1" />
              {t("pending")}
            </Badge>
          );
        case "cancelled":
          return (
            <Badge className="bg-red-100 text-red-800">{t("cancelled")}</Badge>
          );
        default:
          return <Badge variant="outline">{status}</Badge>;
      }
    },
    [t]
  );

  // Demande de service
  const requestService = useCallback(async (serviceId: string) => {
    setRequestServiceId(serviceId);
    setRequestTokens("1");
    setRequestDescription("");
    setRequestFile(null);
    setRequestDialogOpen(true);
  }, []);

  // Soumission demande de service
const submitServiceRequest = async () => {
  try {
    if (!user?.id) {
      toast.error(t("error_unauthorized"));
      return;
    }
    const tokensNum = Math.max(1, parseInt(requestTokens || "1", 10));
    const balance =
      tokenBalances.find((b) => b.tokenId === requestServiceId)?.balance || 0;
    if (tokensNum > balance) {
      toast.error(t("error_insufficient_balance"));
      return;
    }
    setSubmittingRequest(true);

    let fileUrl: string | null = null;
    if (requestFile) {
      const ext = requestFile.name.split('.').pop();
      const path = `justify-${user.id}/${Date.now()}.${ext}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('osecours_justifications')
        .upload(path, requestFile, {
          cacheControl: '3600',
          upsert: false,
        });
      if (uploadError) throw uploadError;
      fileUrl = uploadData?.path
        ? supabase.storage.from('osecours_justifications').getPublicUrl(uploadData.path).data.publicUrl
        : null;
    }

    // 1. Créer la demande de service avec l'URL du fichier
    const { data: requestData, error: insertError } = await supabase
      .from("osecours_requests")
      .insert([
        {
          user_id: user.id,
          service_id: requestServiceId,
          description: requestDescription,
          status: "pending",
          amount: tokensNum,
          justification_url: fileUrl, // <-- ENVOIE L'URL, PAS LE FICHIER
        },
      ])
      .select()
      .single();
      console.log("requestData",requestData)
    if (insertError) throw insertError;

    // 2. Enregistrer la transaction liée à la demande
    const { error: txError } = await supabase
      .from("osecours_transactions")
      .insert([
        {
          user_id: user.id,
          service_id: requestServiceId,
          type: "debit",
          amount: tokensNum,
          status: "pending",
        },
      ]);
    if (txError) throw txError;

    toast.success(t("service_request_success_message"));
    setRequestDialogOpen(false);
    fetchData();
  } catch (e: any) {
    toast.error(e?.message || t("error_service_request"));
  } finally {
    setSubmittingRequest(false);
  }
};

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateMonthlyUsage = (tokenId: string) => {
    const balance = tokenBalances.find((b) => b.tokenId === tokenId);
    if (!balance)
      return {
        used: 0,
        total: MAX_MONTHLY_PURCHASE_PER_SERVICE,
        percentage: 0,
      };
    const used = balance.usedThisMonth || 0;
    const total = balance.monthlyLimit || MAX_MONTHLY_PURCHASE_PER_SERVICE;
    return {
      used,
      total,
      percentage: Math.min(Math.round((used / total) * 100), 100),
    };
  };

  // Ajoute ce helper pour calculer le total acheté ce mois-ci pour un service
  const getMonthlyPurchased = useCallback(
    (tokenId: string): number => {
      // On ne prend que les transactions d'achat confirmées de ce mois
      const startOfMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      ).getTime();
      return transactions
        .filter(
          (tx) =>
            tx.tokenId === tokenId &&
            tx.type === "purchase" &&
            tx.status === "confirmed" &&
            new Date(tx.date).getTime() >= startOfMonth
        )
        .reduce((sum, tx) => sum + tx.amount, 0);
    },
    [transactions]
  );

  // Affichage
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {t("osecours_services")}
        </h2>
        <div className="flex items-center space-x-2">
          <Badge className="bg-green-100 text-green-800">{t("active")}</Badge>
          <Button
            variant="outline"
            size="sm"
            aria-label="Help"
            onClick={() => setHelpOpen(true)}
          >
            <HelpCircle className="h-4 w-4 mr-1" />
            {t("help")}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("your_subscription")}</CardTitle>
          <CardDescription>{t("subscription_description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <ShieldCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {t("status")}
                </p>
                <p className="text-lg font-semibold">{t("active")}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {t("available_services")}
                </p>
                <p className="text-lg font-semibold">{services.length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {t("avg_response_time")}
                </p>
                <p className="text-lg font-semibold">{t("15_min")}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Star className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {t("satisfaction")}
                </p>
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 font-semibold">4.8</span>
                  <span className="text-xs text-gray-500 ml-1">
                    {t("128_reviews")}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <Calendar className="h-4 w-4 inline mr-1" />
              {t("renewal_date", {
                date: new Date(
                  membership?.expiry_date || Date.now()
                ).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                }),
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span>{t("monthly_usage")}</span>
            <span>{calculateMonthlyUsage(selectedToken).percentage}%</span>
          </div>
          <Progress
            value={calculateMonthlyUsage(selectedToken).percentage}
            className="h-2"
          />
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full mt-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="services">{t("services")}</TabsTrigger>
          <TabsTrigger value="requests">{t("my_requests")}</TabsTrigger>
          <TabsTrigger value="history">{t("history")}</TabsTrigger>
          <TabsTrigger value="tokens">{t("my_tokens")}</TabsTrigger>
          <TabsTrigger value="purchase">{t("buy_tokens")}</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card
                key={service.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl">{service.icon || "🛡️"}</span>
                    <Badge variant="default">{service.name}</Badge>
                  </div>
                  <h4 className="font-semibold text-lg mb-2">{service.name}</h4>
                  <p className="text-gray-600 text-sm mb-4">
                    {service.description}
                  </p>
                  <div className="space-y-2 text-sm text-gray-700 mb-4">
                    <p>
                      <strong>{t("price_per_token")}:</strong> CFA{" "}
                      {service.price?.toLocaleString() || "N/A"}
                    </p>
                    <p>
                      <strong>{t("current_balance")}:</strong>{" "}
                      {getTokenBalance(service.id)}
                    </p>
                    <p>
                      <strong>{t("usage_this_month")}:</strong>{" "}
                      {getTokenUsage(service.id)}
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => requestService(service.id)}
                    disabled={getTokenBalance(service.id) < 1}
                    aria-label={`Request ${service.name} service`}
                  >
                    {t("request_service")}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("current_requests")}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : serviceRequests.filter(
                  (req) =>
                    req.status === "in_progress" || req.status === "pending"
                ).length > 0 ? (
                <div className="space-y-4">
                  {serviceRequests
                    .filter(
                      (req) =>
                        req.status === "in_progress" || req.status === "pending"
                    )
                    .map((request) => (
                      <div key={request.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{request.service}</h4>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          {request.description}
                        </p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">
                              {t("request_id")}:
                            </span>
                            <span className="font-medium ml-2">
                              {request.id}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">
                              {t("amount")}:
                            </span>
                            <span className="font-medium ml-2">
                              CFA {request.amount.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">
                              {t("provider")}:
                            </span>
                            <span className="font-medium ml-2">
                              {request.provider}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">
                              {t("estimated_completion")}:
                            </span>
                            <span className="font-medium ml-2">
                              "24h"
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" variant="outline">
                            {t("track_request")}
                          </Button>
                          <Button size="sm" variant="outline">
                            {t("contact_provider")}
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  {t("no_active_requests")}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("service_history")}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold">
                          {t("request_id")}
                        </th>
                        <th className="text-left py-3 px-4 font-semibold">
                          {t("service")}
                        </th>
                        <th className="text-left py-3 px-4 font-semibold">
                          {t("date")}
                        </th>
                        <th className="text-left py-3 px-4 font-semibold">
                          {t("amount")}
                        </th>
                       
                        <th className="text-left py-3 px-4 font-semibold">
                          {t("status")}
                        </th>
                        <th className="text-left py-3 px-4 font-semibold">
{t("actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((request) => (
                        <tr
                          key={request.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-4 px-4 font-medium">
                            {request.id}
                          </td>
                          <td className="py-4 px-4">{request.service}</td>
                          <td className="py-4 px-4">
                            {formatDate(request.date)}
                          </td>
                          <td className="py-4 px-4 font-semibold">
                         {request.amount.toLocaleString()} Token 
                          </td>
                          <td className="py-4 px-4">
                            {getStatusBadge(request.status)}
                          </td>
                           <td className="py-4 px-4">
                            {getStatusBadge(request.type)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  {t("no_service_history")}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tokens" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("your_token_balances")}</CardTitle>
              <CardDescription>{t("manage_tokens")}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : tokenBalances.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {tokenBalances.map((balance) => {
                    const token = services.find(
                      (t) => t.id === balance.tokenId
                    );
                    if (!token) return null;
                    const usage = getTokenUsage(balance.tokenId);
                    const remaining = getRemainingTokens(balance.tokenId);
                    return (
                      <Card key={balance.tokenId} className="overflow-hidden">
                        <div
                          className="h-2"
                          style={{ backgroundColor: token.color || "#eee" }}
                        />
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="text-2xl">
                                {token.icon || "🛡️"}
                              </div>
                              <h3 className="font-semibold">{token.name}</h3>
                            </div>
                            <div className="text-2xl font-bold">
                              {balance.balance}
                            </div>
                          </div>
                          <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {t("usage_this_month")}
                              </span>
                              <span>
                                {usage} /{" "}
                                {balance.monthlyLimit ||
                                  MAX_MONTHLY_PURCHASE_PER_SERVICE}
                              </span>
                            </div>
                            <Progress
                              value={
                                (usage /
                                  (balance.monthlyLimit ||
                                    MAX_MONTHLY_PURCHASE_PER_SERVICE)) *
                                100
                              }
                              className="h-2"
                            />
                            <div className="text-sm text-muted-foreground">
                              {t("remaining_tokens", { count: remaining })}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-4"
                            onClick={() => {
                              setSelectedToken(balance.tokenId);
                              setActiveTab("purchase");
                            }}
                            aria-label={`Buy more ${token.name} tokens`}
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            {t("buy_more")}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {t("no_tokens")}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("transaction_history")}</CardTitle>
              <CardDescription>{t("track_transactions")}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((tx) => {
                    const token = services.find((t) => t.id === tx.tokenId);
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-full bg-muted">
                            {token?.icon || "💳"}
                          </div>
                          <div>
                            <p className="font-medium">
                              {tx.amount} {token?.name || "Token"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(tx.date)}
                            </p>
                            
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            CFA {tx.totalPrice.toLocaleString()}
                          </p>
                          {getStatusBadge(tx.status)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {t("no_transactions")}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchase" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("buy_tokens")}</CardTitle>
              <CardDescription>{t("buy_tokens_description")}</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{t("error")}</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <TokenPurchase
                onPurchaseSuccess={fetchData}
                userBalances={tokenBalances.map((b) => ({
                  serviceType: b.tokenId as any,
                  usedThisMonth: b.usedThisMonth || 0,
                }))}
                selectedToken={selectedToken}
                // monthlyPurchased={getMonthlyPurchased(selectedToken)}
                // minPurchase={MIN_PURCHASE_PER_SERVICE}
                // maxMonthlyPurchase={MAX_MONTHLY_PURCHASE_PER_SERVICE}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Request Service Dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("request_service")}</DialogTitle>
            <DialogDescription>
              {t("describe_service_request") ||
                "Provide details for your assistance request."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("service")}</Label>
              <Select
                value={requestServiceId}
                onValueChange={setRequestServiceId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("select_service") || "Select service"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("tokens_to_use") || "Tokens to use"}</Label>
              <Input
                type="number"
                min={1}
                max={getTokenBalance(requestServiceId)}
                value={requestTokens}
                onChange={(e) => setRequestTokens(e.target.value)}
              />
              <div className="text-xs text-muted-foreground mt-1">
                {t("available")}: {getTokenBalance(requestServiceId)}
              </div>
            </div>
            <div>
              <Label>{t("description")}</Label>
              <Textarea
                rows={4}
                value={requestDescription}
                onChange={(e) => setRequestDescription(e.target.value)}
                placeholder={t("describe_need") || "Describe your need..."}
              />
            </div>
           <div>
  <Label> "Type de document"</Label>
  <Select value={fileType} onValueChange={v => setFileType(v as "image" | "pdf")}>
    <SelectTrigger>
      <SelectValue placeholder="Choisir le type" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="image">Image</SelectItem>
      <SelectItem value="pdf">PDF</SelectItem>
    </SelectContent>
  </Select>
</div>
<div>
  <Label>
    {t("justification_attachment") || "Justification*"}
  </Label>
  <Input
    type="file"

    accept={fileType === "image" ? "image/*" : "application/pdf"}
    onChange={e => setRequestFile(e.target.files?.[0] || null)}
  />
  {requestFile && (
    <div className="text-xs mt-1 text-green-700">
      {t("selected_file") || "Fichier sélectionné"}: {requestFile.name}
    </div>
  )}
</div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRequestDialogOpen(false)}
            >
              {t("cancel") || "Cancel"}
            </Button>
            <Button onClick={submitServiceRequest} disabled={submittingRequest}>
              {submittingRequest
                ? t("submitting") || "Submitting..."
                : t("submit_request") || "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="max-w-4xl w-[90vw]">
          <DialogHeader>
            <DialogTitle>Disclaimer</DialogTitle>
          </DialogHeader>
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-6 max-h-[80vh] overflow-y-auto">
              {/* ... Ton contenu disclaimer ... */}
              <div className="mt-6 p-4 bg-orange-100 rounded-lg">
                <h4 className="font-semibold text-orange-800 mb-2">
                  Contact our support team:
                </h4>
                <div className="flex flex-wrap items-center gap-4">
                  <a
                    href="tel:+22344943844"
                    className="flex items-center gap-2 text-orange-700 hover:text-orange-900"
                  >
                    <Phone className="h-5 w-5" />
                    <span className="font-medium">+223 44 94 38 44</span>
                  </a>
                  <span className="text-orange-300">|</span>
                  <a
                    href="tel:+22378810191"
                    className="flex items-center gap-2 text-orange-700 hover:text-orange-900"
                  >
                    <Phone className="h-5 w-5" />
                    <span className="font-medium">+223 78 81 01 91</span>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OSecoursSection;
