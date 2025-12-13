import {Badge} from '@/components/ui/badge'

export function HeroBadges(){

    return (
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 my-6">
            <Badge variant="green">2.1kb gzipped</Badge>
            <Badge variant="gray">0 dependencies</Badge>
            <Badge variant="blue">Fully Typed</Badge>
        </div>

    )
}