import { Info } from "lucide-react";
import { Badge } from "./Badge";
import { ClipboardButton } from "./ClipboardButton";
import { isFeatureEnabled } from "@/lib/featureflag";
import { CatalogueDetailParametersTable } from "./CatalogueDetailParametersTable";
import { CatalogueCwlDetailParametersTable } from "./CatalogueCwlDetailParametersTable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./Tabs";
import type { Algorithm } from "../../types/models/algorithm";
import { AlgorithmType } from "../../types/models/algorithm";

const ExecutionInfoContent = ({
  algorithm,
  applicationDetails,
  isDefinitionProtected,
  executionLinks,
  executionInfoLabels,
  orderUrl,
  cwlUrl,
  hasProcessInfo,
  hasServiceLinks,
  hasParameters,
}: {
  algorithm: Algorithm;
  applicationDetails?: any;
  isDefinitionProtected: boolean;
  executionLinks: any[];
  executionInfoLabels: Record<string, string>;
  orderUrl?: string;
  cwlUrl?: string;
  hasProcessInfo: boolean;
  hasServiceLinks: boolean;
  hasParameters: boolean;
}) => {
  return (
    <>
      <ul className="flex flex-col gap-5 mb-6">
        {hasProcessInfo && (
          <li>
            <div className="flex gap-2" data-testid="execution-info-label">
              <p className="text-white">Process ID</p>
            </div>
            <p>
              <span className="text-gray-400 break-words">{algorithm.id}</span>
              <ClipboardButton text={algorithm.id} />
            </p>
          </li>
        )}
        {hasServiceLinks &&
          executionLinks.map((link, index) => (
            <li key={index}>
              <div className="flex gap-2" data-testid="execution-info-label">
                <p className="text-white">
                  {executionInfoLabels[link.rel] || link.title}
                </p>
                {link.rel === "application" && isDefinitionProtected && (
                  <Badge className="font-normal text-sm rounded-sm">
                    protected
                  </Badge>
                )}
              </div>
              <p>
                <a className="text-gray-400 break-all" href={link.href}>
                  {link.href}
                </a>
                <ClipboardButton text={link.href} />
              </p>
            </li>
          ))}
      </ul>
      {hasParameters && (
        <>
          {applicationDetails && algorithm.type === AlgorithmType.OPENEO && (
            <CatalogueDetailParametersTable details={applicationDetails} />
          )}
          {!orderUrl && cwlUrl && (
            <CatalogueCwlDetailParametersTable cwlUrl={cwlUrl} />
          )}
        </>
      )}
    </>
  );
};

interface ExecutionInfoTabsProps {
  algorithm: Algorithm;
  applicationDetails?: any;
  isDefinitionProtected: boolean;
  executionInfoLinksRel: string[];
  executionInfoLabels: Record<string, string>;
  orderUrl?: string;
  cwlUrl?: string;
  udpDocsUrl: string;
}

export const ExecutionInfoTabs = ({
  algorithm,
  applicationDetails,
  isDefinitionProtected,
  executionInfoLinksRel,
  executionInfoLabels,
  orderUrl,
  cwlUrl,
  udpDocsUrl,
}: ExecutionInfoTabsProps) => {
  const executionLinks = algorithm.links.filter((link) =>
    executionInfoLinksRel.includes(link.rel),
  );

  const hasProcessInfo =
    applicationDetails && algorithm.type === AlgorithmType.OPENEO;
  const hasServiceLinks = executionLinks.length > 0;
  const hasParameters =
    (applicationDetails && algorithm.type === AlgorithmType.OPENEO) ||
    (!orderUrl && cwlUrl);

  const shouldUseTabs = isFeatureEnabled(window.location.href, "costAnalysis");

  if (!shouldUseTabs) {
    return (
      <section className="bg-brand-teal-30 bg-opacity-20 rounded-md p-6 text-white mb-8">
        <h2
          className="text-xl md:text-2xl mb-6 relative inline-flex"
          id="execution-information"
        >
          Execution information
          {hasProcessInfo && (
            <div className="absolute top-1/2 transform -translate-y-1/2 right-0 -mr-6">
              <a
                href={udpDocsUrl}
                target="__blank"
                className="text-white inline-block rounded-full hover:bg-brand-teal-50/20"
              >
                <Info className="w-4 h-4" />
              </a>
            </div>
          )}
        </h2>
        <ExecutionInfoContent
          algorithm={algorithm}
          applicationDetails={applicationDetails}
          isDefinitionProtected={isDefinitionProtected}
          executionLinks={executionLinks}
          executionInfoLabels={executionInfoLabels}
          orderUrl={orderUrl}
          cwlUrl={cwlUrl}
          hasProcessInfo={hasProcessInfo}
          hasServiceLinks={hasServiceLinks}
          hasParameters={hasParameters}
        />
      </section>
    );
  }

  return (
    <section className="rounded-md text-white mb-8">
      <Tabs defaultValue="execution">
        <TabsList>
          <TabsTrigger
            value="execution"
            className="bg-black/10 data-[state=active]:text-white data-[state=active]:bg-brand-teal-30/20"
            id="execution-information"
          >
            Execution information
            {hasProcessInfo && (
              <span className="ml-2">
                <a
                  href={udpDocsUrl}
                  target="__blank"
                  className="text-white inline-block rounded-full hover:bg-brand-teal-50/20"
                >
                  <Info className="w-4 h-4" />
                </a>
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="cost-analysis"
            className="bg-black/10 data-[state=active]:text-white data-[state=active]:bg-brand-teal-30/20"
            id="cost-analysis"
          >
            Cost analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="execution"
          className="p-6 bg-brand-teal-30/20 rounded-b-md"
        >
          <ul className="flex flex-col gap-5 mb-6">
            {hasProcessInfo && (
              <li>
                <div className="flex gap-2" data-testid="execution-info-label">
                  <p className="text-white">Process ID</p>
                </div>
                <p>
                  <span className="text-gray-400 break-words">
                    {algorithm.id}
                  </span>
                  <ClipboardButton text={algorithm.id} />
                </p>
              </li>
            )}
            {executionLinks.map((link, index) => (
              <li key={index}>
                <div className="flex gap-2" data-testid="execution-info-label">
                  <p className="text-white">
                    {executionInfoLabels[link.rel] || link.title}
                  </p>
                  {link.rel === "application" && isDefinitionProtected && (
                    <Badge className="font-normal text-sm rounded-sm">
                      protected
                    </Badge>
                  )}
                </div>
                <p>
                  <a className="text-gray-400 break-all" href={link.href}>
                    {link.href}
                  </a>
                  <ClipboardButton text={link.href} />
                </p>
              </li>
            ))}
          </ul>
          {hasParameters && (
            <>
              {applicationDetails &&
                algorithm.type === AlgorithmType.OPENEO && (
                  <CatalogueDetailParametersTable
                    details={applicationDetails}
                  />
                )}
              {!orderUrl && cwlUrl && (
                <CatalogueCwlDetailParametersTable cwlUrl={cwlUrl} />
              )}
            </>
          )}
        </TabsContent>
        <TabsContent
          value="cost-analysis"
          className="p-6 bg-brand-teal-30/20 rounded-b-md"
        >
          <p>Cost analysis content goes here.</p>
        </TabsContent>
      </Tabs>
    </section>
  );
};
