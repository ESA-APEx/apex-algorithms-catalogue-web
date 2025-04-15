import { useState, useEffect } from 'react'
import { FilterIcon, SearchIcon } from 'lucide-react'
import { Card } from './Card'
import { Input } from './Input'
import { Badge } from './Badge'
import { Button } from './Button'
import { Checkbox } from './Checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './Select'
import { Popover, PopoverTrigger, PopoverContent } from './Popover'
import { BenchmarkStatus } from './BenchmarkStatus'
import { Spinner } from './Spinner'
import type { Algorithm } from '../../types/models/algorithm'
import {
  MultiSelector,
  MultiSelectorTrigger,
  MultiSelectorInput,
  MultiSelectorContent,
  MultiSelectorList,
  MultiSelectorItem,
}  from './MultiSelect'
import { generateUniqueOptions } from '../../lib/utils'
import type { BenchmarkStatusKey, BenchmarkSummary } from '@/types/models/benchmark'
import { getBenchmarkSummary } from '@/lib/api'
import { getBenchmarkStatus, STATUS_THRESHOLD } from '@/lib/benchmark-status'
import { isFeatureEnabled } from '@/lib/featureflag';

interface CatalogueListProps {
    catalogues: Algorithm[]
}

const sortOptions = [
    {
        value: 'name', 
        label: 'Name',
    },
    {
        value: 'last updated',
        label: 'Last updated'
    },
    {
        value: 'benchmark status',
        label: 'Benchmark status'
    }
] as const

type SortOption = typeof sortOptions[number]['value']

interface SearchAndSortFilterParams {
    query: string
    sortBy: SortOption
    filterBy: {
        labels: string[]
        licenses: string[]
        types: string[]
        benchmarkStatus: string[]
    }
    catalogues: Algorithm[]
    benchmarkData?: BenchmarkSummary[]
}

const searchAndSortFilterCatalogues = ({ 
    query, 
    sortBy, 
    catalogues, 
    benchmarkData, 
    filterBy 
}: SearchAndSortFilterParams) => {
    const statusOrder = {
        stable: 0,
        unstable: 1,
        'no benchmark': 2,
    }
    if (!!query || !!sortBy) {
        const normalizedQuery = query.toLowerCase()
        const benchmarkStatusData: Record<string, BenchmarkSummary> = {}
        benchmarkData?.forEach(data => {
            benchmarkStatusData[data.scenario_id] = data;
        })

        return catalogues
            .filter(
                ({ type, properties, id }) => {
                    const benchmarkStatus: BenchmarkStatusKey = benchmarkStatusData[id] ? 
                        getBenchmarkStatus(benchmarkStatusData[id]) : 
                        'no benchmark'
                    const hitSearch = properties.title.toLowerCase().includes(normalizedQuery) || 
                        properties.description.toLowerCase().includes(normalizedQuery)

                    const hitLabels = []
                    const normalizedKeywords = properties.keywords.map((i) => i.toLowerCase())
                    for (const label of filterBy.labels) {
                        if (normalizedKeywords.includes(label.toLowerCase())) {
                            hitLabels.push(label)
                        }
                    }
                    const hitFilterByLabels = filterBy.labels.length ? hitLabels.length : true
                    const hitFilterByLicense = filterBy.licenses.length ? filterBy.licenses.includes(properties.license) : true
                    const hitFilterByTypes = filterBy.types.length ? filterBy.types.includes(type) : true
                    const hitFilterByBenchmarkStatus = filterBy.benchmarkStatus.length ? 
                        filterBy.benchmarkStatus.includes(benchmarkStatus) : 
                        true

                    return hitSearch && hitFilterByLabels && hitFilterByLicense && hitFilterByTypes && hitFilterByBenchmarkStatus
                }
            )
            .sort((a, b) => {
                if (sortBy === 'last updated') {
                    return new Date(b.properties.updated).getTime() - new Date(a.properties.updated).getTime();
                } else if (sortBy === 'name') {
                    return b.properties.title.toLowerCase() < a.properties.title.toLowerCase() ? 1 : -1;
                }

                const benchmarkStatusDataA = benchmarkStatusData[a.id] ? 
                    getBenchmarkStatus(benchmarkStatusData[a.id]) : 'no benchmark'
                const benchmarkStatusDataB = benchmarkStatusData[b.id] ? 
                    getBenchmarkStatus(benchmarkStatusData[b.id]) : 'no benchmark'
                    
                return statusOrder[benchmarkStatusDataA] - statusOrder[benchmarkStatusDataB];
            })
    }
    return catalogues;
}

const getCataloguesFilterList = (catalogues: Algorithm[]) => {
    let labels: string[] = []
    const licenses: string[] = []
    const types: string[] = []

    for (const catalogue of catalogues) {
        labels = [...labels, ...catalogue.properties.keywords.map(keyword => keyword.toLowerCase())] 
        licenses.push(catalogue.properties.license) 
        types.push(catalogue.type)
    }

    return {
        labels: generateUniqueOptions(labels),
        licenses: generateUniqueOptions(licenses),
        types: generateUniqueOptions(types),
        benchmarkStatus: generateUniqueOptions(Object.keys(STATUS_THRESHOLD)),
    }
}

export const CatalogueList = ({ catalogues }: CatalogueListProps) => {
    const isBenchmarkStatusEnabled = isFeatureEnabled(window.location.href, 'benchmarkStatus');
    const [query, setQuery] = useState<string>('')
    const [sortBy, setSortBy] = useState<SortOption>('name')
    const [filterByLabels, setFilterByLabels] = useState<string[]>([])
    const [filterByLicenses, setFilterByLicenses] = useState<string[]>([])
    const [filterByTypes, setFilterByTypes] = useState<string[]>([])
    const [filterByBenchmarkStatus, setFilterByBenchmarkStatus] = useState<string[]>([])
    const [benchmarkData, setBenchmarkData] = useState<BenchmarkSummary[]>()
    const {labels, licenses, types, benchmarkStatus} = getCataloguesFilterList(catalogues)
    const toggledSortOptions = isBenchmarkStatusEnabled ? sortOptions : sortOptions.filter(option => option.value != 'benchmark status')

    const data = searchAndSortFilterCatalogues({
        query, 
        sortBy, 
        catalogues, 
        benchmarkData,
        filterBy: {
            labels: filterByLabels,
            licenses: filterByLicenses,
            types: filterByTypes,
            benchmarkStatus: filterByBenchmarkStatus,
        } 
    })
    const filterCounts = filterByLabels.length + filterByLicenses.length + 
        filterByTypes.length + filterByBenchmarkStatus.length

    const clearFilters = () => {
        setFilterByLabels([])
        setFilterByLicenses([])
        setFilterByTypes([])
        setFilterByBenchmarkStatus([])
    }
    const fetchBenchmarkData = async () => {
        try {
            const result = await getBenchmarkSummary();
            setBenchmarkData(result ?? []);
        } catch (error) {
            console.error(error);
            setBenchmarkData([]);
        }
    };

    useEffect(() => {
        if (isBenchmarkStatusEnabled) {
            fetchBenchmarkData();
        }
    }, [])

    return 	(
        <>
            <div className="relative max-w-screen-sm mx-auto mb-6">
                <SearchIcon className="absolute w-5 h-5 left-2 top-2 text-brand-gray-50" />
                <Input 
                    className="pl-10"
                    type="text" 
                    placeholder="Search algorithms..." 
                    value={query} 
                    onInput={(e) => setQuery(e.currentTarget.value)} 
                />
            </div>
            <div className="flex flex-row-reverse gap-3 mb-6">
                <div className="flex-none">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline">
                                <FilterIcon className="mr-1 h-4 w-4" /> Filter
                                {
                                    filterCounts ? <Badge className="ml-1">{filterCounts}</Badge> : null
                                }
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="relative">
                            <Button
                                variant="link"
                                onClick={clearFilters}
                                className="absolute right-0 top-2">
                                Reset
                            </Button>
                            <p className="mb-1">Type</p>
                            <div className="flex flex-col mb-4">
                                {
                                    types.map(({label, value}) => (
                                        <label key={value} className="flex items-center gap-1" data-testid='filter-type-item'>
                                            <Checkbox
                                                key={value}
                                                checked={filterByTypes.includes(value)}
                                                onCheckedChange={(checked) => {
                                                    return checked ?
                                                        setFilterByTypes([...filterByTypes, value]) :
                                                        setFilterByTypes(filterByTypes.filter(item => item != value))
                                                }}
                                            />
                                            <span>{label}</span>
                                        </label>
                                    ))
                                }
                            </div>
                            <p className="mb-1">Licenses</p>
                            <div className="flex flex-col mb-4">
                                {
                                    licenses.map(({label, value}) => (
                                        <label key={value} className="flex items-center gap-1" data-testid='filter-license-item'>
                                            <Checkbox
                                                key={value}
                                                checked={filterByLicenses.includes(value)}
                                                onCheckedChange={(checked) => {
                                                    return checked ?
                                                        setFilterByLicenses([...filterByLicenses, value]) :
                                                        setFilterByLicenses(filterByLicenses.filter(item => item != value))
                                                }}
                                            />
                                            <span>{label}</span>
                                        </label>
                                    ))
                                }
                            </div>
                            { 
                                isBenchmarkStatusEnabled ? 
                                    (
                                        <>
                                            <p className="mb-1">Benchmark status</p>
                                            <div className="flex flex-col mb-4">
                                                {
                                                    benchmarkStatus.map(({label, value}) => (
                                                        <label key={value} className="flex items-center gap-1" data-testid='filter-benchmark-status'>
                                                            <Checkbox
                                                                key={value}
                                                                checked={filterByBenchmarkStatus.includes(value)}
                                                                onCheckedChange={(checked) => {
                                                                    return checked ?
                                                                        setFilterByBenchmarkStatus([...filterByBenchmarkStatus, value]) :
                                                                        setFilterByBenchmarkStatus(filterByBenchmarkStatus.filter(item => item != value))
                                                                }}
                                                            />
                                                            <span>{label}</span>
                                                        </label>
                                                    ))
                                                }
                                            </div>
                                            
                                        </>
                                    ) : null
                            }
                            <p>Labels</p>
                            <MultiSelector values={filterByLabels} onValuesChange={setFilterByLabels} loop={false}>
                                <MultiSelectorTrigger>
                                    <MultiSelectorInput placeholder="Select labels"/>
                                </MultiSelectorTrigger>
                                <MultiSelectorContent>
                                    <MultiSelectorList>
                                        {labels.map((option, i) => (
                                            <MultiSelectorItem key={i} value={option.value}>
                                                {option.label}
                                            </MultiSelectorItem>
                                        ))}
                                    </MultiSelectorList>
                                </MultiSelectorContent>
                            </MultiSelector>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="flex-none">
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            { 
                                toggledSortOptions.map(
                                    ({ value, label }) => 
                                        <SelectItem key={value} value={value}>{label}</SelectItem>
                                ) 
                            }
                        </SelectContent>
                    </Select>
                </div>

            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="apps">
                {data.map((item, id) => (
                    <li key={id} data-testid="apps-item">
                        <Card
                            key={id}
                            href={`/apps/${item.id}`}
                            type={item.type}
                            title={item.properties.title}
                            body={item.properties.description}
                            labels={item.properties.keywords}
                            thumbnail={item.links.find(link => link.rel === 'thumbnail')?.href}
                        >
                            { isBenchmarkStatusEnabled ? (
                                <div className="text-brand-teal-80 text-sm mt-2">
                                    {
                                        benchmarkData ? 
                                        <BenchmarkStatus key={`status-${id}`} scenarioId={item.id} data={benchmarkData} /> :
                                        <Spinner />
                                    }
                                </div>
                                ) : null
                            }
                        </Card>
                    </li>
                ))}
            </ul>
        </>
    )
}