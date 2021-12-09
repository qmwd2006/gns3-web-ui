/*
* Software Name : GNS3 Web UI
* Version: 3
* SPDX-FileCopyrightText: Copyright (c) 2022 Orange Business Services
* SPDX-License-Identifier: GPL-3.0-or-later
*
* This software is distributed under the GPL-3.0 or any later version,
* the text of which is available at https://www.gnu.org/licenses/gpl-3.0.txt
* or see the "LICENSE" file for more details.
*
* Author: Sylvain MATHIEU, Elise LEBEAU
*/
import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {Server} from "@models/server";
import {MatSort, MatSortable} from "@angular/material/sort";
import {UserService} from "@services/user.service";
import {ProgressService} from "../../common/progress/progress.service";
import {User} from "@models/users/user";
import {BehaviorSubject, merge, Observable} from "rxjs";
import {DataSource} from "@angular/cdk/collections";
import {map} from "rxjs/operators";
import {AddBlankProjectDialogComponent} from "@components/projects/add-blank-project-dialog/add-blank-project-dialog.component";
import {AddUserDialogComponent} from "@components/user-management/add-user-dialog/add-user-dialog.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  server: Server;
  dataSource: UserDataSource;
  userDatabase = new UserDatabase();
  displayedColumns = ['name', 'email', 'is_active', 'is_superadmin', 'last'];

  searchText: string = '';

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private progressService: ProgressService,
    public dialog: MatDialog) { }

  ngOnInit() {
    this.server = this.route.snapshot.data['server'];
    if (!this.server) this.router.navigate(['/servers']);

    this.refresh();
    this.sort.sort(<MatSortable>{
      id: 'name',
      start: 'asc',
    });
    this.dataSource = new UserDataSource(this.userDatabase, this.sort);
  }

  refresh() {
    this.userService.list(this.server).subscribe(
      (users: User[]) => {
        this.userDatabase.addUsers(users);
      },
      (error) => {
        this.progressService.setError(error);
      }
    );
  }

  addUser() {
    const dialogRef = this.dialog.open(AddUserDialogComponent, {
      width: '400px',
      autoFocus: false,
      disableClose: true,
    });
    let instance = dialogRef.componentInstance;
    instance.server = this.server;
    dialogRef.afterClosed().subscribe(() => this.refresh());
  }

}

export class UserDatabase {
  dataChange: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);

  get data(): User[] {
    return this.dataChange.value;
  }

  public addUsers(users: User[]) {
    this.dataChange.next(users);
  }

  public remove(user: User) {
    const index = this.data.indexOf(user);
    if (index >= 0) {
      this.data.splice(index, 1);
      this.dataChange.next(this.data.slice());
    }
  }
}

export class UserDataSource extends DataSource<any> {
  constructor(public userDatabase: UserDatabase, private sort: MatSort) {
    super();
  }

  connect(): Observable<User[]> {
    const displayDataChanges = [this.userDatabase.dataChange, this.sort.sortChange];

    return merge(...displayDataChanges).pipe(
      map(() => {
        if (!this.sort.active || this.sort.direction === '') {
          return this.userDatabase.data;
        }

        return this.userDatabase.data.sort((a, b) => {
          const propertyA = a[this.sort.active];
          const propertyB = b[this.sort.active];

          const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
          const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

          return (valueA < valueB ? -1 : 1) * (this.sort.direction === 'asc' ? 1 : -1);
        });
      })
    );
  }

  disconnect() {}
}
