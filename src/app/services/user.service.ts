import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '../models/user';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PaginatedResponse } from '../models/api-response';
import {toCamelCase} from "../utils/object-helper";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient)

  host: string = "http://localhost:8015/users"

  validateEmail(email: string): Observable<boolean> {
    const params = new HttpParams()
    .set('email', email.toString())

    return this.http.get<boolean>(this.host + `/validEmail`, {params});
  }

  updateUser(id: number, user: User, userId: number): Observable<User> {
    const headers = new HttpHeaders({
      'x-user-id': userId
    });

    return this.http.put<User>(`${this.host}/${id}`, user, { headers });
  }

  deleteUser(id: number, userId: number) {
    const headers = new HttpHeaders({
      'x-user-id': userId
    });

    return this.http.delete<any>(`${this.host}/${id}`, {headers});
  }

  addUser(user: User, userId: number): Observable<User> {
    const headers = new HttpHeaders({
      'x-user-id': userId
    });

    console.log(user)

    return this.http.post<User>(`${this.host}`, user, {headers});
  }

  getAllUsers(page: number, size: number, isActive?: boolean) {
    let params = new HttpParams()
    .set('page', page.toString())
    .set('size', size.toString());

    if (isActive !== undefined) {
      params = params.append('active', isActive.toString());
    }

    return this.http.get<PaginatedResponse<User>>(this.host, { params }).pipe(
      map((response: PaginatedResponse<any>) => {
        const transformedUser = response.content.map((user: any) => toCamelCase(user));
        return {
          ...response,
          content: transformedUser
        };
      })
    );
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.host}/${id}`).pipe(
      map((data: any) => {
        return toCamelCase(data)
      })
    );
  }

  /**
   * Obtiene un usuario por ID utilizando HttpClient.
   * Retorna un Observable con los datos del usuario o un error.
   *
   * @param id El ID del usuario a buscar.
   * @returns Observable con los datos del usuario.
   */
  getUserById2(id: number): Observable<User> {
    return this.http.get<User>(`${this.host}/${id}`)
      .pipe(
        map(response => response),
        catchError(this.handleError)
      );
  }

  /**
   * Manejo de errores en solicitudes HTTP.
   *
   * @param error El error HTTP que ocurrió.
   * @returns Observable que lanza un error.
   */
  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('An error occurred:', error.error);
    } else {
      console.error(`Backend returned code ${error.status}, body was: `, error.error);
    }
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}
