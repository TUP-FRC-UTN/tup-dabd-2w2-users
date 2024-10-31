import { Component, inject, OnInit } from '@angular/core';
import {
  Form,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from 'ngx-dabd-grupo01';
import {OwnerService} from "../../../../../services/owner.service";
import {OwnerPlotService} from "../../../../../services/owner-plot.service";
import {LoadFileService} from "../../../../../services/load-file.service";
import {PlotService} from "../../../../../services/plot.service";
import {Plot} from "../../../../../models/plot";
import {Owner} from "../../../../../models/owner";
import {plotForOwnerValidator} from "../../../../../validators/cadastre-plot-for-owner";
import {BatchFileType, FileTypeMap, FileUploadData} from "../../../../../models/file";

interface FileData {
  fileType: BatchFileType;
  name: string | null | undefined;
}

interface FormData {
  fileTypeFront: string | null | undefined;
  nameFront: string | null | undefined;
  fileTypeBack: string | null | undefined;
  nameBack: string | null | undefined;
  files: FileData[];
}

@Component({
  selector: 'app-files-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './files-form.component.html',
  styleUrl: './files-form.component.css',
})
export class FilesFormComponent implements OnInit {
  constructor(private activatedRoute: ActivatedRoute, private router: Router) {}

  protected ownerService = inject(OwnerService);
  protected ownerPlotService = inject(OwnerPlotService);
  private fileService = inject(LoadFileService);
  private plotService = inject(PlotService);
  private toastService = inject(ToastService);

  selectedFiles: File[] = [];
  isUploading: boolean = false;
  id: string | null = null;
  plots: Plot[] = [];
  fileTypeOptions!: any;
  owner!: Owner;
  files: Map<string, File> = new Map();
  fileTypes: Map<string, string> = new Map();

  filesForm = new FormGroup({
    dniBack: new FormControl('', [Validators.required]),
    dniFront: new FormControl('', [Validators.required]),
    fileTypeFront: new FormControl('', [Validators.required]),
    nameFront: new FormControl('', [Validators.required]),
    contentTypeFront: new FormControl('', [Validators.required]),
    fileTypeBack: new FormControl('', [Validators.required]),
    nameBack: new FormControl('', [Validators.required]),
    contentTypeBack: new FormControl('', [Validators.required]),
    filesInput: new FormArray<FormGroup>([]),
  });

  get filesInput(): FormArray {
    return this.filesForm.controls['filesInput'] as FormArray;
  }


  addFilesInput() {
    const fileInput = new FormGroup({
      blockNumber: new FormControl('', [Validators.required]),
      plotNumber: new FormControl(
        '',
        [Validators.required],
        [plotForOwnerValidator(this.plotService)]
      ),
      plotFile: new FormControl('', [Validators.required]),
      fileType: new FormControl('', [Validators.required]),
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
      ]),
    });

    this.filesInput.push(fileInput);
  }

  removeFileInput(index: number) {
    this.filesInput.removeAt(index);
    this.files.delete('plotFile' + index);
    this.fileTypes.delete('fileType' + index);
  }

  ngOnInit() {
    this.setEnums();
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    if (this.id) {
      this.ownerService.getOwnerById(parseInt(this.id, 10)).subscribe({
        next: (response) => {
          this.owner = response;
        },
        error: (error) => {
          console.error('Error al obtener owners:', error);
        },
      });
    }
  }
  

  onSubmit() {
    console.log("Archivos para subir. onUpload() ", this.files);
    this.onUploadNacho();
  }

  /**
   * Triggered when the user selects a file from the file input.
   *
   * @param event The file input event containing the selected file.
   */
   onFileSelected(event: Event, controlName: string): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const renamedFile: File = this.renameFileIfNeeded(target.files[0]);
      this.files.set(controlName, renamedFile);
    } else {
      this.files.delete(controlName);
    }
    console.log("File map: ", this.files);
  }

  onFileTypeSelected(event: Event, controlName: string): void {
    const selectElement = event.target as HTMLSelectElement;
    if (selectElement) {
      this.fileTypes.set(controlName, selectElement.value);
    } else {
      this.fileTypes.delete(controlName);
    }
  }

  renameFileIfNeeded(originalFile: File): File {
    let counter = 0;
    let newFileName = originalFile.name;
    console.log("Entro a renombrado");
    while(this.isFileNameInMap(newFileName)) {
      console.log("Colision");
      newFileName = counter + originalFile.name;
      counter++;
    }
    return new File([originalFile], newFileName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified,
    });
  }

  private isFileNameInMap(fileName: string): boolean {
    for (const file of this.files.values()) {
      if (file.name === fileName) {
        return true;
      }
    }
    return false;
  }


  /**
   * Upload the selected file to the server using the FileUploadService.
   */
  onUpload(): void {
    console.log("ARCHIVOS SELECCIONADOS ", this.selectedFiles);
    if (this.selectedFiles.length > 0) {
      this.isUploading = true;
      const formData = this.getFormData();
      const fileUploadData = this.buildFileUploadData(formData, this.selectedFiles);

      console.log("DATA PARA SUBIR: fileUploadData = ", fileUploadData);
      
      //  ---------------------------------- que hace este if(true) -----------------------------------
      
      if (true) { 
        this.fileService
          .uploadFiles(1, 1, fileUploadData) // mock owner and user ids
          .subscribe({
            next: (response) => {
              console.log('Files uploaded successfully:', response);
              this.isUploading = false;
            },
            error: (error) => {
              console.error('Error uploading files:', error);
              this.toastService.sendError('Error al cargar los archivos');
              this.isUploading = false;
            },
            complete: () => {
              console.log('File upload process completed');
              this.toastService.sendSuccess('Archivos cargados exitosamente.');
              this.isUploading = false;
              this.router.navigate(['/owner/list']);
            },
          });
      }
    } else {
      console.log('No files selected for upload.');
      this.toastService.sendError('No hay archivos seleccionados para cargar');
    }
  }

  onUploadNacho(): void {
    // TODO: Cambiar esta validacion para que en vez de ver si existe algun archivo
    // que se fije que esten todos los archivos.
    console.log("fileTypes.size: ", this.fileTypes.size);
    if (!this.files.get('dniFront') || !this.files.get('dniFront')) {
      this.toastService.sendError('No hay archivos de dni cargados');
      return;
    } else if (this.files.size < 3) {
      this.toastService.sendError('Agregue por lo menos un lote y cargue un archivo');
      return;
    } else if (this.fileTypes.size == 0) {
      this.toastService.sendError('Seleccione un tipo de archivo de lote a cargar');
      return;
    }

    // hablar con nacho para entender bien este método


    const fileTypeMap: FileTypeMap = this.createFileTypeMap();
    this.fileService
      .uploadFilesNacho(this.getSelectedFiles(), fileTypeMap, 1, 1)
      .subscribe({
        next: (response) => {
          console.log('Files uploaded successfully:', response);
          this.isUploading = false;
        },
        error: (error) => {
          console.error('Error uploading files:', error);
          this.toastService.sendError('Error al cargar los archivos');
          this.isUploading = false;
        },
        complete: () => {
          console.log('File upload process completed');
          this.toastService.sendSuccess('Archivos cargados exitosamente.');
          this.isUploading = false;
          this.router.navigate(['/owner/list']);
        },
      });
  }

  private createFileTypeMap() {
    const typeMap: { [key: string]: string } = {};
    typeMap[this.files.get('dniFront')?.name!] = 'ID_DOCUMENT_FRONT';
    typeMap[this.files.get('dniBack')?.name!] = 'ID_DOCUMENT_BACK';
    //plotFile
    //fileType
    this.filesInput.controls.forEach((formGroup, i) => {
      typeMap[this.files.get('plotFile' + i)?.name!] = this.fileTypes.get(
        'fileType' + i
      )!;
    });
    return { typeMap: typeMap } as FileTypeMap;
  }

  private getSelectedFiles(): File[] {
    const filteredFiles: File[] = [];
    this.files.forEach((file, controlName) => filteredFiles.push(file));
    return filteredFiles;
  }

  /**
   * Collects and structures the form data into a single object,
   * including files and details for each plot input.
   */
  getFormData(): FormData {
    const formData: FormData = {
      fileTypeFront: this.filesForm.value.fileTypeFront,
      nameFront: this.filesForm.value.nameFront,
      fileTypeBack: this.filesForm.value.fileTypeBack,
      nameBack: this.filesForm.value.nameBack,
      files: [],
    };
    this.filesInput.controls.forEach((control) => {
      const fileData = {
        fileType: control.value.fileType,
        name: control.value.name,
      };

      formData.files.push(fileData);
    });
    return formData;
  }




  /**
   * Constructs an array of FileUploadData objects from a FormData object.
   *
   * This function transforms the structured data from FormData, including
   * each file's type and details, into an array format that can be used
   * for the upload service. It handles both front and back ID files and
   * any additional plot-related files included in the form.
   *
   * @param formData - The structured form data containing main files,
   *                   such as front and back IDs, and plot-specific files.
   * @returns An array of FileUploadData objects, each containing a file
   *          and its associated type for upload.
   */
  buildFileUploadData(formData: FormData, selectedFiles: File[]): FileUploadData[] {
    const fileUploadData: FileUploadData[] = [];
    if (formData.nameFront && formData.fileTypeFront) {
      fileUploadData.push({
        file: selectedFiles[0],
        fileType: formData.fileTypeFront,
        fileName: formData.nameFront
      });
    }
    if (formData.nameBack && formData.fileTypeBack) {
      fileUploadData.push({
        file: selectedFiles[1],
        fileType: formData.fileTypeBack,
        fileName: formData.nameBack
      });
    }
    formData.files.forEach((fileData, i) => {
      if (fileData.name && fileData.fileType) {
        fileUploadData.push({
          file: selectedFiles[i + 2],
          fileType: fileData.fileType,
          fileName: fileData.name
        });
      }
    });
    return fileUploadData;
  }


  // no esta en la nueva implementacion para carga de archivos
  setEnums() {
    this.fileTypeOptions = Object.entries(BatchFileType).map(
      ([key, value]) => ({
        value: key,
        display: value,
      })
    );
  }
}
