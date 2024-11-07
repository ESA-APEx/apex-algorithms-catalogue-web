import { useState, useEffect, useRef } from 'react';
import { clsx } from "clsx";
import Sticky from 'react-stickynode';
import { TableOfContents, Globe, ChevronDown } from 'lucide-react';
import { Button } from './Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./DropdownMenu";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './Select';
import type { Algorithm } from '../../types/models/algorithm';
import type { ToCElement } from '../../types/models/catalogue';

export interface CatalogueDetailActions {
    data: Algorithm
    toc: ToCElement[]
}

const BASE_STAC_BROWSER_URL = 'https://browser.apex.apex.esa.int/external/';

export const CatalogueDetailActions = ({ data, toc }: CatalogueDetailActions) => {
    const sections: ToCElement[] = [
        ...toc,
        {
            id: 'execution-information',
            title: 'Execution information',
            depth: 1,
        },
    ]
    const [selectedSection, setSelectedSection] = useState<string>(sections[0].id);
    const ref = useRef({ isScrollIntoView: false });
    const exampleLinks = data.links.filter(item => item.rel === 'example');

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !ref.current.isScrollIntoView) {
                    window.history.replaceState({}, "", `#${entry.target.id}`);
                    setSelectedSection(entry.target.id);
                }
            })
        }, {
            rootMargin: '-100px',
        });

        sections.forEach((section) => {
            const headingEl = document.getElementById(section.id)
            if (headingEl) {
                observer.observe(headingEl)
            }
        });

        return () => {
            // Cleanup: disconnect observer on component unmount
            observer.disconnect();
        };
    }, [])

    const onChangeSection = (value: string) => {
        const target = document.getElementById(value);

        if (target) {
            ref.current.isScrollIntoView = true;

            target.scrollIntoView();
            window.history.replaceState({}, "", `#${value}`);
            setSelectedSection(value);

            window.setTimeout(() => {
                ref.current.isScrollIntoView = false;
            }, 1000);
        }
    }

    return (
        <Sticky enabled top={0}>
            <aside>
                <div className="flex gap-4"> 
                    <Select value={selectedSection} onValueChange={onChangeSection}>
                        <SelectTrigger className="relative max-w-72 text-md pl-8 text-left">
                            <TableOfContents className="w-4 h-4 absolute top-1/2 transform -translate-y-1/2 left-2" /> 
                            <SelectValue>
                                <span>Section: {sections.find(section => section.id === selectedSection)?.title}</span>
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            { 
                                sections.map(
                                    ({ id, title, depth }) => 
                                        <SelectItem key={id} value={id} className={clsx([{ 'pl-10': depth === 2, 'pl-12': depth >= 2 }])}>{title}</SelectItem>
                                ) 
                            }
                        </SelectContent>
                    </Select>
                    {
                        exampleLinks.length > 0 && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="secondary" className="text-md font-normal">
                                            <Globe /> 
                                            <span>Preview example outputs</span>
                                            <ChevronDown className="opacity-50" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56">
                                            {
                                                exampleLinks.map(link => (
                                                    <DropdownMenuItem key={link.href}>
                                                        {
                                                            link.type === 'application/json' && link.href.includes('.json') ? (
                                                                <a 
                                                                    href={new URL(link.href.replace('https://', '/external/'), BASE_STAC_BROWSER_URL).href} 
                                                                    target="__blank" 
                                                                    className="font-normal text-md">
                                                                    {link.title}
                                                                </a>
                                                            ) :
                                                            (
                                                                <a 
                                                                    href={link.href} 
                                                                    target="__blank" 
                                                                    download
                                                                    className="font-normal text-md">
                                                                    {link.title}
                                                                </a>
                                                            )
                                                        }
                                                    </DropdownMenuItem>
                                                ))

                                            }
                                    </DropdownMenuContent>
                                </DropdownMenu>
                        )
                    }
                </div>
            </aside>
        </Sticky>
    )
}