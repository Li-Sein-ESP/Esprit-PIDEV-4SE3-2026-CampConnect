import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'sin',
    standalone: true
})
export class SinPipe implements PipeTransform {
    transform(angleInDegrees: number): number {
        return Math.sin(angleInDegrees * (Math.PI / 180));
    }
}

@Pipe({
    name: 'cos',
    standalone: true
})
export class CosPipe implements PipeTransform {
    transform(angleInDegrees: number): number {
        return Math.cos(angleInDegrees * (Math.PI / 180));
    }
}
