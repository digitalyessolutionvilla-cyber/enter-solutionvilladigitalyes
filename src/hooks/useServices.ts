import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { services as fallbackServices } from "@/lib/data";

export interface Service {
  id?: string;
  icon: string;
  title: string;
  description: string;
  tag: string;
  sort_order: number;
  is_active: boolean;
  link_href?: string;
}

export function useServices(): Service[] {
  const [services, setServices] = useState<Service[]>(fallbackServices as unknown as Service[]);

  useEffect(() => {
    supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        if (data && data.length > 0) setServices(data);
      });
  }, []);

  return services;
}
