"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    paypal?: any;
  }
}

interface PayPalButtonProps {
  amount: number;
  currency?: string;
  description: string;
  onSuccess?: (details: any) => void;
  onError?: (err: any) => void;
}

export default function PayPalButton({
  amount,
  currency = "USD",
  description,
  onSuccess,
  onError,
}: PayPalButtonProps) {
  const paypalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !paypalRef.current) return;

    // PayPal SDK 스크립트 로드
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test"}&currency=${currency}`;
    script.async = true;
    script.onload = () => {
      if (window.paypal && paypalRef.current) {
        window.paypal
          .Buttons({
            createOrder: (data: any, actions: any) => {
              return actions.order.create({
                purchase_units: [
                  {
                    description: description,
                    amount: {
                      currency_code: currency,
                      value: amount.toFixed(2),
                    },
                  },
                ],
              });
            },
            onApprove: async (data: any, actions: any) => {
              try {
                const order = await actions.order.capture();
                if (onSuccess) {
                  onSuccess(order);
                }
              } catch (err) {
                if (onError) {
                  onError(err);
                }
              }
            },
            onError: (err: any) => {
              if (onError) {
                onError(err);
              }
            },
            style: {
              layout: "vertical",
              color: "blue",
              shape: "rect",
              label: "paypal",
            },
          })
          .render(paypalRef.current);
      }
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup: 스크립트 제거
      const existingScript = document.querySelector(
        `script[src*="paypal.com/sdk/js"]`
      );
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [amount, currency, description, onSuccess, onError]);

  return <div ref={paypalRef} className="paypal-button-container" />;
}
