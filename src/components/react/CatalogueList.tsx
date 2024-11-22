import { useState } from 'react'
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
    }
    catalogues: Algorithm[]
}

const searchAndSortFilterCatalogues = ({ query, sortBy, catalogues, filterBy }: SearchAndSortFilterParams) => {
    if (!!query || !!sortBy) {
        const normalizedQuery = query.toLowerCase()
        return catalogues
            .filter(
                ({ type, properties }) => {
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

                    return hitSearch && hitFilterByLabels && hitFilterByLicense && hitFilterByTypes
                }
            )
            .sort((a, b) => {
                if (sortBy === 'last updated') {
                    return new Date(b.properties.updated).getTime() - new Date(a.properties.updated).getTime()
                }
                return a.properties.title.toLowerCase() < b.properties.title.toLowerCase() ? -1 : 1;
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
    }
}

export const CatalogueList = ({ catalogues }: CatalogueListProps) => {
    const [query, setQuery] = useState<string>('')
    const [sortBy, setSortBy] = useState<SortOption>('name')
    const [filterByLabels, setFilterByLabels] = useState<string[]>([])
    const [filterByLicenses, setFilterByLicenses] = useState<string[]>([])
    const [filterByTypes, setFilterByTypes] = useState<string[]>([])
    const {labels, licenses, types} = getCataloguesFilterList(catalogues)

    const data = searchAndSortFilterCatalogues({
        query, 
        sortBy, 
        catalogues, 
        filterBy: {
            labels: filterByLabels,
            licenses: filterByLicenses,
            types: filterByTypes,
        } 
    })
    const filterCounts = filterByLabels.length + filterByLicenses.length
    const clearFilters = () => {
        setFilterByLabels([])
        setFilterByLicenses([])
        setFilterByTypes([])
    }

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
            <div className="grid grid-cols-2 mb-6">
                <div>
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            { 
                                sortOptions.map(
                                    ({ value, label }) => 
                                        <SelectItem key={value} value={value}>{label}</SelectItem>
                                ) 
                            }
                        </SelectContent>
                    </Select>
                </div>
                <div className="text-right">
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
                                        <label key={value} className="flex items-center gap-1">
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
                                        <label key={value} className="flex items-center gap-1">
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
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="apps">
                {data.map((item, id) => (
                    <li key={id} data-testid="apps-item">
                        <Card
                            key={id}
                            href={`/apps/${item.id}`}
                            type={item.type}
                            title={item.properties.title}
                            body={item.properties.description}
                            labels={item.properties.keywords}
                        />
                    </li>
                ))}
            </ul>
        </>
    )
}