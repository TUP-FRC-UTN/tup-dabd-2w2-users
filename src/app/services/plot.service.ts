import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Plot } from '../models/plot';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { PaginatedResponse } from '../models/api-response';
import { TransformPlotPipe } from '../pipes/plot-mapper.pipe';

@Injectable({
  providedIn: 'root'
})
export class PlotService {
  private http = inject(HttpClient)

  host: string = "http://localhost:8282/plots"

  getAllPlots(page : number, size : number, isActive? : boolean): Observable<PaginatedResponse<Plot>> {
    let params = new HttpParams()
    .set('page', page.toString())
    .set('size', size.toString());
  
    if (isActive !== undefined) {
      params = params.append('isActive', isActive.toString());
    }
    
    return this.http.get<PaginatedResponse<Plot>>(this.host, { params }).pipe(
      map((response: PaginatedResponse<any>) => {
        const transformPipe = new TransformPlotPipe();
        const transformedPlots = response.content.map((plot: any) => transformPipe.transform(plot));
        return {
          ...response,
          content: transformedPlots 
        };
      })
    );
  }

  createPlot(plotData: any, userId: number): Observable<Plot> {
    const headers = new HttpHeaders({
      'x-user-id': userId
    });

    return this.http.post<Plot>(this.host, plotData, { headers });
  }

  updatePlot(id: number, plotData: any, userId: number): Observable<Plot> {
    const headers = new HttpHeaders({
      'x-user-id': userId
    });
    
    return this.http.put<Plot>(`${this.host}/${id}`, plotData, { headers });
  }

  deletePlot(id: number, userId: number) {
    const headers = new HttpHeaders({
      'x-user-id': userId
    });

    return this.http.delete<any>(`${this.host}/${id}`, {headers});
  }

  getPlotById(id: number): Observable<Plot> {
    return this.http.get<any>(`${this.host}/${id}`).pipe(
      map((data: any) => {
        const transformPipe = new TransformPlotPipe(); 
        return transformPipe.transform(data); 
      })
    );
  }

  getPlotByPlotNumberAndBlockNumber(plotNumber : number, blockNumber : number) {
    const params = new HttpParams()
    .set('plotNumber', plotNumber.toString())
    .set('blockNumber', blockNumber.toString());

    return this.http.get<Plot>(`${this.host}/validation`, {params})
  }

  filterPlotByBlock(page : number, size : number, blockNumber : string, isActive? : boolean) {
    let params = new HttpParams()
    .set('page', page.toString())
    .set('size', size.toString());
  
    if (isActive !== undefined) {
      params = params.append('isActive', isActive.toString());
    }
    
    return this.http.get<PaginatedResponse<Plot>>(`${this.host}/blockNumber/${blockNumber}`, { params }).pipe(
      map((response: PaginatedResponse<any>) => {
        const transformPipe = new TransformPlotPipe();
        const transformedPlots = response.content.map((plot: any) => transformPipe.transform(plot));
        return {
          ...response,
          content: transformedPlots 
        };
      })
    );
  }

  filterPlotByStatus(page : number, size : number, plotStatus : string, isActive? : boolean) {
    let params = new HttpParams()
    .set('page', page.toString())
    .set('size', size.toString());
  
    if (isActive !== undefined) {
      params = params.append('isActive', isActive.toString());
    }
    
    return this.http.get<PaginatedResponse<Plot>>(`${this.host}/plotStatus/${plotStatus}`, { params }).pipe(
      map((response: PaginatedResponse<any>) => {
        const transformPipe = new TransformPlotPipe();
        const transformedPlots = response.content.map((plot: any) => transformPipe.transform(plot));
        return {
          ...response,
          content: transformedPlots 
        };
      })
    );
  }

  filterPlotByType(page : number, size : number, plotType : string, isActive? : boolean) {
    let params = new HttpParams()
    .set('page', page.toString())
    .set('size', size.toString());
  
    if (isActive !== undefined) {
      params = params.append('isActive', isActive.toString());
    }
    
    return this.http.get<PaginatedResponse<Plot>>(`${this.host}/plotType/${plotType}`, { params }).pipe(
      map((response: PaginatedResponse<any>) => {
        const transformPipe = new TransformPlotPipe();
        const transformedPlots = response.content.map((plot: any) => transformPipe.transform(plot));
        return {
          ...response,
          content: transformedPlots 
        };
      })
    );
  }

  reactivatePlot(id: number, userId: number) {
    const headers = new HttpHeaders({
      'x-user-id': userId.toString()
    });

    return this.http.patch<Plot>(`${this.host}/reactivate/${id}`, {}, {headers});
  }
}
