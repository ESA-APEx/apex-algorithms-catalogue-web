import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { Badge } from "./Badge";
import { ClipboardButton } from "./ClipboardButton";
import { isFeatureEnabled } from "@/lib/featureflag";
import { getBenchmarkDetails } from "@/lib/api";
import { format } from "date-fns";
import { CatalogueDetailParametersTable } from "./CatalogueDetailParametersTable";
import { CatalogueCwlDetailParametersTable } from "./CatalogueCwlDetailParametersTable";
import { MapViewer } from "./MapViewer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./Tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./Table";
import type { Algorithm } from "../../types/models/algorithm";
import { AlgorithmType } from "../../types/models/algorithm";
import type { BenchmarkData } from "@/types/models/benchmark";
import type { BenchmarkScenario } from "@/types/models/benchmark-scenario";

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

interface ParametersTableProps {
  parameters: Array<{ name: string; value: string }>;
}

export const ParametersTable = ({ parameters }: ParametersTableProps) => {
  return (
    <Table
      className="bg-white bg-opacity-5 rounded-lg"
      data-testid="parameters-table"
    >
      <TableHeader>
        <TableRow>
          <TableHead>Parameter</TableHead>
          <TableHead className="w-2/3">Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {parameters.map((parameter) => (
          <TableRow key={parameter.name}>
            <TableCell>{parameter.name}</TableCell>
            <TableCell className="break-all">{parameter.value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

interface CostAnalysisContentProps {
  serviceId: string;
  scenarios: BenchmarkScenario[];
}

const getParametersFromScenario = (scenario: BenchmarkScenario) => {
  const parameters: Array<{ name: string; value: string }> = [];
  const processGraphKey = Object.keys(scenario.process_graph)[0];

  for (const [key, value] of Object.entries(
    scenario.process_graph[processGraphKey].arguments,
  )) {
    parameters.push({ name: key, value: JSON.stringify(value) });
  }

  return parameters;
};

const getGeometryFromScenario = (scenario: BenchmarkScenario) => {
  try {
    const processGraphKey = Object.keys(scenario.process_graph)[0];
    const args = scenario.process_graph[processGraphKey]?.arguments;
    return (
      args?.geometry ||
      args?.bbox ||
      args?.spatial_extent ||
      args?.geometries ||
      null
    );
  } catch (error) {
    console.error("Failed to extract geometry from scenario:", error);
    return null;
  }
};

const getDateRange = (data: BenchmarkData[] | undefined) => {
  if (data?.length) {
    const startDate = new Date(data[data.length - 1].start_time);
    const endDate = new Date(data[0].start_time);
    return `${format(startDate, "MMM yyyy")} - ${format(endDate, "MMM yyyy")}`;
  }
  return "-";
};

const getAverageCostPerKm = (data: BenchmarkData[]) => {
  if (!data.length) return "-";
  const totalCost = data.reduce(
    (sum, item) => sum + item.costs / item.area_size,
    0,
  );
  return `${(totalCost / data.length).toFixed(2)} platform credits / km²`;
};

const getAverageBenchmarkDuration = (data: BenchmarkData[]) => {
  if (!data.length) return "-";
  const totalDuration = data.reduce((sum, item) => sum + item.duration, 0);
  return `${(totalDuration / data.length).toFixed(2)} s`;
};

const CostAnalysisContent = ({
  serviceId,
  scenarios,
}: CostAnalysisContentProps) => {
  const [data, setData] = useState<BenchmarkData[]>();
  const [status, setStatus] = useState<string>("loading");

  const dateRange = getDateRange(data);

  const fetchData = async () => {
    setStatus("loading");
    try {
      const result = await getBenchmarkDetails(serviceId);
      if (result) {
        setData(result.data);
        setStatus("success");
      }
    } catch (error) {
      setStatus("error");
      console.error("Failed to fetch benchmark status", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [serviceId]);

  if (status === "loading") {
    return <p className="text-gray-400">Loading benchmark data...</p>;
  }

  if (status === "error") {
    return <p className="text-red-400">Failed to load benchmark data.</p>;
  }

  if (!data?.length)
    return <p className="text-gray-400">No benchmark data available.</p>;

  const averageCost = getAverageCostPerKm(data);
  const firstScenarioGeometry = getGeometryFromScenario(scenarios[0]);

  return (
    <article className="text-gray-300">
      <aside className="mb-4">
        <p className="text-sm">
          Based on {data.length} benchmark runs ({dateRange})
        </p>
      </aside>
      <h3 className="text-white mb-2">Overview</h3>
      <div className="mb-5 flex flex-col xl:flex-row gap-5">
        <ul className="flex-1">
          <li className="mb-1">Average cost: {averageCost}</li>
          <li>
            Average benchmark duration: {getAverageBenchmarkDuration(data)}
          </li>
        </ul>
        {scenarios.length === 1 && firstScenarioGeometry ? (
          <div className="flex-1">
            <div className="bg-brand-teal-50/50 w-full h-full">
              <MapViewer
                height="200px"
                geometry={JSON.stringify(firstScenarioGeometry)}
              />
            </div>
          </div>
        ) : null}
      </div>
      {scenarios.length > 1 ? (
        <>
          <h3 className="text-white mb-2">
            Benchmark scenarios ({scenarios.length})
          </h3>
          <ul className="mb-5">
            {scenarios.map((scenario) => {
              const geometry = getGeometryFromScenario(scenario);

              return (
                <li key={scenario.id}>
                  <article className="bg-white bg-opacity-5 rounded-md p-4 mb-5">
                    <h4 className="text-white font-medium mb-2">
                      {scenario.id}
                    </h4>
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                      <div className="xl:col-span-2">
                        <ul className="mb-4">
                          <li>
                            Average cost:{" "}
                            {getAverageCostPerKm(
                              data.filter(
                                (item) => item.scenario_id === scenario.id,
                              ),
                            )}
                          </li>
                          <li>
                            Average benchmark duration:{" "}
                            {getAverageBenchmarkDuration(
                              data.filter(
                                (item) => item.scenario_id === scenario.id,
                              ),
                            )}
                          </li>
                        </ul>
                        <ParametersTable
                          parameters={getParametersFromScenario(scenario)}
                        />
                      </div>
                      {geometry ? (
                        <div className="flex-1">
                          <div className="bg-brand-teal-50/50 w-full h-full">
                            <MapViewer geometry={JSON.stringify(geometry)} />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </article>
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
  benchmarkScenarios: BenchmarkScenario[];
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
  benchmarkScenarios,
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
          {benchmarkScenarios.length > 0 ? (
            <TabsTrigger
              value="cost-analysis"
              className="bg-black/10 data-[state=active]:text-white data-[state=active]:bg-brand-teal-30/20"
              id="cost-analysis"
            >
              Cost analysis
            </TabsTrigger>
          ) : null}
        </TabsList>

        <TabsContent
          value="execution"
          className="p-6 bg-brand-teal-30/20 rounded-b-md rounded-tr-md"
        >
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
        </TabsContent>
        {benchmarkScenarios.length > 0 ? (
          <TabsContent
            value="cost-analysis"
            className="p-6 bg-brand-teal-30/20 rounded-b-md rounded-tr-md"
          >
            <CostAnalysisContent
              serviceId={algorithm.id}
              scenarios={benchmarkScenarios}
            />
          </TabsContent>
        ) : null}
      </Tabs>
    </section>
  );
};
