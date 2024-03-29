import { Component, OnInit } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { AuthenticationService } from '../shared/authentication-service';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, concat, forkJoin, Observable } from 'rxjs';
import { flatMap, map, mergeMap, switchMap } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Component({
  selector: 'app-subida',
  templateUrl: './subida.page.html',
  styleUrls: ['./subida.page.scss'],
})
export class SubidaPage implements OnInit {
  usuario: any;
  constructor(
    private afStore: AngularFirestore,
    private authService: AuthenticationService,
    private activatedRoute: ActivatedRoute,
    private storage: AngularFireStorage
  ) {
    this.usuario = this.authService.getUsuario();
  }
  cosas: string;
  fotos: any;
  fotosPropias: any;
  isLike = new BehaviorSubject(false);
  userIsLike: Boolean = false;
  cargando: Boolean = true;

  ngOnInit() {
    this.activatedRoute.params.subscribe((params) => {
      this.cosas = params['cosas'];
    });
    //let foto = this.afStore.collection('fotos').snapshotChanges();

    let foto = this.afStore
      .collection('fotos', (ref) =>
        ref.orderBy('date', 'desc').where('seccion', '==', this.cosas)
      )
      .snapshotChanges();
    foto
      .pipe(
        switchMap((fotos) => {
          const res = fotos.map((r) => {
            return this.afStore
              .collection('fotos')
              .doc(r.payload.doc.id)
              .collection('likes')
              .doc(this.usuario.uid)
              .snapshotChanges()
              .pipe(
                map((fa) => {
                  if (fa.payload.exists) {
                    this.userIsLike = true;
                  } else {
                    this.userIsLike = false;
                  }
                  return {
                    own: r.payload.doc.data()['own'],
                    name: r.payload.doc.data()['name'],
                    file: r.payload.doc.data()['file'],
                    date: r.payload.doc.data()['date'],
                    likes: r.payload.doc.data()['likes'],
                    key: r.payload.doc.id,
                    isLike: this.userIsLike,
                  };
                })
              );
          });
          return combineLatest([...res]);
        })
      )
      .subscribe((fotos) => {
        console.log(fotos);
        this.fotos = fotos;
        this.cargando = false;
      });
    /* foto.subscribe((dataFotos) => {
      this.fotos = dataFotos.map((e) => {
        this.afStore
          .collection('fotos')
          .doc(e.payload.doc.id)
          .collection('likes')
          .doc(this.usuario.uid)
          .snapshotChanges()
          .subscribe((changes) => {
            if (changes.payload.exists) {
              this.userIsLike = true;
            } else {
              this.userIsLike = false;
            }
          });
        return {
          own: e.payload.doc.data()['own'],
          name: e.payload.doc.data()['name'],
          file: e.payload.doc.data()['file'],
          date: e.payload.doc.data()['date'],
          likes: e.payload.doc.data()['likes'],
          key: e.payload.doc.id,
          isLike: this.userIsLike,
        };
      });

      console.log(this.fotos);
    }); */

    /* let foto = this.afStore
      .collection(
        'fotos',
        (ref) => ref.orderBy('date', 'desc')
        //.where('isPublish', '==', 'true')
      )
      .snapshotChanges();
    foto.subscribe((dataFotos) => {
      this.fotos = dataFotos.map((e) => {
        let like = this.afStore
          .collection(`fotos/${e.payload.doc.id}/likes`)
          .doc(this.usuario.uid)
          .snapshotChanges();
        let gusta = like.subscribe((dataLikes) => {
          console.log(dataLikes.payload.data());
          console.log(dataLikes.payload.data()['gusta']);
          return {
            own: e.payload.doc.data()['own'],
            name: e.payload.doc.data()['name'],
            file: e.payload.doc.data()['file'],
            date: e.payload.doc.data()['date'],
            key: e.payload.doc.id,
            isLike: dataLikes.payload.data()['gusta'],
          };
        });
        return gusta;
        
      });
      console.log(dataFotos);
      console.log(this.fotos);
    }); */

    /* let cond = this.afStore
      .collection(
        'fotos',
        (ref) =>
          ref.orderBy('date', 'desc').where('own', '==', this.usuario.uid)
        //.where('isPublish', '==', 'true')
      )
      .snapshotChanges();
    cond.subscribe((data) => {
      this.fotosPropias = data.map((e) => {
        return {
          own: e.payload.doc.data()['own'],
          name: e.payload.doc.data()['name'],
          file: e.payload.doc.data()['file'],
          date: e.payload.doc.data()['date'],
        };
      });
      console.log(this.fotosPropias);
    }); */

    //.where('id', '==', 'fK3ddutEpD2qQqRMXNW5').get()
  }

  like(key, likesNumber) {
    console.log(key);
    /* const likeRef: AngularFirestoreDocument<any> = this.afStore.doc(
      `fotos/${key}/likes/${this.usuario.uid}`
    );
    likeRef.valueChanges().subscribe((e) => {
      console.log(e);
    }); */
    this.isLike.next(!this.isLike.value);
    console.log(this.isLike.value);

    /*this.afStore.collection(`fotos/${key}/likes`).add(like);
    this.afStore
      .collection(`fotos/${key}/likes`)
      .doc(this.usuario.uid)
      .set(like);*/
    /* this.afStore
      .doc(`fotos/${key}/likes/${this.usuario.uid}`)
      .set(like, { merge: true }); */
    console.log(this.fotos);
    this.afStore
      .collection('fotos')
      .doc(key)
      .collection('likes')
      .doc(this.usuario.uid)
      .set({});
    this.afStore.doc(`fotos/${key}`).update({
      likes: likesNumber + 1,
    });
    /* this.afStore
      .collection('fotos')
      .doc(key)
      .collection('likes')
      .doc(this.usuario.uid)
      .snapshotChanges()
      .subscribe((changes) => {
        if (changes.payload.exists) {
          this.userIsLike = true;
        }
      }); */
  }

  disLike(key, likesNumber) {
    console.log(key);
    /* const likeRef: AngularFirestoreDocument<any> = this.afStore.doc(
      `fotos/${key}/likes/${this.usuario.uid}`
    );
    likeRef.valueChanges().subscribe((e) => {
      console.log(e);
    }); */
    this.isLike.next(!this.isLike.value);
    console.log(this.isLike.value);

    /*this.afStore.collection(`fotos/${key}/likes`).add(like);
    this.afStore
      .collection(`fotos/${key}/likes`)
      .doc(this.usuario.uid)
      .set(like);*/
    /* this.afStore
      .doc(`fotos/${key}/likes/${this.usuario.uid}`)
      .set(like, { merge: true }); */
    console.log(this.fotos);
    this.afStore
      .collection('fotos')
      .doc(key)
      .collection('likes')
      .doc(this.usuario.uid)
      .delete();
    this.afStore.doc(`fotos/${key}`).update({
      likes: likesNumber - 1,
    });
  }

  //Borra fotos, pero no borra la coleccion de likes, queda suelta
  delete(foto) {
    const filePath = this.cosas == 'lindas' ? `cosas-lindas/` : `cosas-feas/`;
    this.afStore
      .collection('fotos')
      .doc(foto.key)
      .delete()
      .then((res) => {
        const storageRef = this.storage.ref(filePath);
        storageRef.child(foto.name).delete();
      })
      .catch((e) => {
        console.log(e);
      });
  }
}
