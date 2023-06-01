import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';

@NgModule({
  imports: [MatDialogModule, MatButtonModule],
  exports: [MatCardModule, MatFormFieldModule, MatTableModule, MatSelectModule, MatInputModule, MatButtonModule, MatMenuModule, MatIconModule, MatDialogModule],
  declarations: [ConfirmDialogComponent],
})
export class MaterialModule {}
