import { useState } from "react";
import { SquareArrowOutUpRight, TriangleAlert } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";

interface WebAppLink {
  href: string;
  title?: string;
}

interface WebAppLinksProps {
  webApps: WebAppLink[];
  orderUrl?: string;
  placeholder?: string;
  variant?: "primary" | "secondary";
}

const isGeospatialExplorer = (webApp: WebAppLink) =>
  (webApp.title || "").toLowerCase().includes("geospatial explorer");

const showWarning = (orderUrl: string | undefined, webApp: WebAppLink) =>
  Boolean(orderUrl) && !isGeospatialExplorer(webApp);

const warning = "Access to this service requires a valid account and authorization on the platform.";

export const WebAppLinks = ({
  webApps,
  orderUrl,
  placeholder = "Execute service",
  variant = "primary",
}: WebAppLinksProps) => {
  const variantClass = variant === "primary" ? "btn-primary" : "btn-secondary";
  const [selectedHref, setSelectedHref] = useState("");

  if (webApps.length === 0) return null;

  return (
    <li className="mt-2">
      <Select
        value={selectedHref}
        onValueChange={(href) => {
          setSelectedHref(href);
          window.open(href, "_blank", "noopener,noreferrer");
        }}
      >
        <SelectTrigger
          className={`btn ${variantClass} !flex relative w-full items-center justify-center text-center px-10 [&>span]:w-full [&>span]:text-center [&>svg]:absolute [&>svg]:right-3 !h-auto`}
          aria-label="Choose web application"
          data-testid="webapp-select"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-2rem)]">
          {webApps.map((webApp) => (
            <SelectItem key={webApp.href} value={webApp.href}>
              {webApp.title || "Execute service"}
              {showWarning(orderUrl, webApp) && (
                <p>
                    <span className="inline-flex">
                        <TriangleAlert className="w-5 h-5 mr-1" />
                        <span className="text-xs">{warning}</span>
                    </span>
                </p>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </li>
  );
};
