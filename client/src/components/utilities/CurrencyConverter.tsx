
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface ExchangeRate {
  [key: string]: number;
}

const CurrencyConverter = () => {
  const [amount, setAmount] = useState<string>("1000");
  const [fromCurrency, setFromCurrency] = useState<string>("OUV");
  const [toCurrency, setToCurrency] = useState<string>("USD");
  const [convertedAmount, setConvertedAmount] = useState<string>("");
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate>({
    // Default rates (static for demo purposes)
    OUV: 1,
    USD: 0.0016,
    EUR: 0.0015,
    GBP: 0.0013,
    NGN: 2.45,
    GHS: 0.022,
    ZAR: 0.030,
    KES: 0.25,
  });

  useEffect(() => {
    convertCurrency();
  }, [amount, fromCurrency, toCurrency, exchangeRates]);

  const convertCurrency = () => {
    if (!amount || isNaN(parseFloat(amount))) {
      setConvertedAmount("");
      return;
    }

    const numericAmount = parseFloat(amount);
    const fromRate = exchangeRates[fromCurrency] || 1;
    const toRate = exchangeRates[toCurrency] || 1;
    
    // Convert to base currency (OUV), then to target currency
    const valueInOUV = numericAmount / fromRate;
    const result = valueInOUV * toRate;
    
    setConvertedAmount(result.toFixed(2));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const currencies = [
    { code: "OUV", name: "CFA Franc (OUV)" },
    { code: "USD", name: "US Dollar (USD)" },
    { code: "EUR", name: "Euro (EUR)" },
    { code: "GBP", name: "British Pound (GBP)" },
    { code: "NGN", name: "Nigerian Naira (NGN)" },
    { code: "GHS", name: "Ghanaian Cedi (GHS)" },
    { code: "ZAR", name: "South African Rand (ZAR)" },
    { code: "KES", name: "Kenyan Shilling (KES)" },
  ];

  return (
    <Card>
      
    </Card>
  );
};

export default CurrencyConverter;
