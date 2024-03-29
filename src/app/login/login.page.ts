import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../shared/authentication-service';
import { ToastService } from '../shared/toast.service';
import { ErrorsService } from '../shared/errors.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  isSubmitted = false;
  cargando: boolean = false;
  cargandoAdmin: boolean = false;
  cargandoUsuario: boolean = false;
  cargandoInvitado: boolean = false;
  cargandoAnonimo: boolean = false;
  cargandoTester: boolean = false;

  constructor(
    public authService: AuthenticationService,
    public router: Router,
    public toastService: ToastService,
    public errorsService: ErrorsService,
    public formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    console.log(this.authService.isLogged);
  }

  get errorControl() {
    return this.loginForm.controls;
  }

  logIn() {
    this.isSubmitted = true;
    this.cargando = true;
    if (!this.loginForm.valid) {
      console.log('Please provide all the required values!');
      this.cargando = false;
      return false;
    } else {
      console.log(this.loginForm.value);
      this.authService
        .SignIn(this.loginForm.value.email, this.loginForm.value.password)
        .then((res) => {
          console.log(res);
          this.router.navigate(['botones-principales']);
          /* if (this.authService.isEmailVerified) {

        } else {
          window.alert('Email is not verified');
          return false;
        } */
        })
        .catch((error) => {
          console.log(error.code);
          let err = this.errorsService.getErrors(error.code);
          this.toastService.presentToast(err);
          //this.toastService.presentLoading();
          // this.toastService.presentLoadingWithOptions();
          // setTimeout(() => {
          //   this.toastService.cancelLoading();
          // }, 1000);
        })
        .finally(() => (this.cargando = false));
    }
  }

  loguearAs(profile) {
    switch (profile) {
      case 'admin':
        this.cargandoAdmin = true;
        var data = {
          email: 'admin@admin.com',
          password: '111111',
        };
        break;
      case 'invitado':
        this.cargandoInvitado = true;
        var data = {
          email: 'invitado@invitado.com',
          password: '222222',
        };
        break;
      case 'usuario':
        this.cargandoUsuario = true;
        var data = {
          email: 'usuario@usuario.com',
          password: '333333',
        };
        break;
      case 'anonimo':
        this.cargandoAnonimo = true;
        var data = {
          email: 'anonimo@anonimo.com',
          password: '444444',
        };
        break;
      case 'tester':
        this.cargandoTester = true;
        var data = {
          email: 'tester@tester.com',
          password: '555555',
        };
        break;

      default:
        break;
    }

    this.authService
      .SignIn(data.email, data.password)
      .then((res) => {
        console.log(res);
        this.router.navigate(['botones-principales']);
      })
      .catch((error) => {
        console.log(error.code);
        let err = this.errorsService.getErrors(error.code);
        this.toastService.presentToast(err);
      })
      .finally(() => {
        this.cargandoAdmin = false;
        this.cargandoInvitado = false;
        this.cargandoUsuario = false;
        this.cargandoAnonimo = false;
        this.cargandoTester = false;
      });
  }
}
