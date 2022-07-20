import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { LoginService } from '@services/login.service';
import { Server } from '../models/server';
import { ServerService } from '../services/server.service';

@Injectable()
export class LoginGuard implements CanActivate {
  constructor(private serverService: ServerService, private loginService: LoginService, private router: Router) {}

  async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const controller_id = next.paramMap.get('controller_id');
    this.loginService.controller_id = controller_id;
    let controller = await this.serverService.get(parseInt(controller_id, 10));
    try {
      await this.loginService.getLoggedUser(controller);
    } catch (e) {}
    return this.serverService.get(parseInt(controller_id, 10)).then((controller: Server) => {
      if (controller.authToken && !controller.tokenExpired) {
        return true;
      }
      this.router.navigate(['/controller', controller.id, 'login'], { queryParams: { returnUrl: state.url } });
    });
  }
}
