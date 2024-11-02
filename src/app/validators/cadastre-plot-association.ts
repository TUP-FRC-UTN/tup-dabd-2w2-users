import { AbstractControl, AsyncValidatorFn, ValidationErrors } from "@angular/forms";
import { map, switchMap, timer, of, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PlotService } from "../services/plot.service";
import {OwnerPlotService} from "../services/owner-plot.service";

export const cadastrePlotAssociation = (service: OwnerPlotService, plotId: number): AsyncValidatorFn => {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {

    //TODO: Hacer que esto se ejecute, pq no se ejecuta.

    console.log(plotId)
    console.log(plotId)
    console.log(plotId)
    console.log(plotId)

    if (!plotId) {
      return of(null);
    }

    console.log("VIVA LA PEPA")
    console.log("VIVA LA PEPA")
    console.log("VIVA LA PEPA")
    console.log("VIVA LA PEPA")

    return timer(1000).pipe(
      switchMap(() =>
        service.giveActualOwner(plotId).pipe(
          map(() => {
            return null;
          }),
          catchError((error) => {
            if (error.status === 204) {
              return of({ plotWithNoOwner: true });
            }
            return of({ serverError: true });
          })
        )
      )
    );
  };
};
