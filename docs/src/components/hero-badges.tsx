import {Badge} from '@/components/ui/badge'

export function HeroBadges(){

    return (
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 my-6">
            <Badge variant="green">0 dependencies </Badge>
            <Badge variant="gray">7.1kb gzipped</Badge>
            <Badge variant="blue">framework agnostic</Badge>
        </div>

    )
}