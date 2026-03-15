import { Component, OnInit, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApisService } from '../services/apis.service';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
    selector: 'app-master-options',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, TranslatePipe],
    templateUrl: './master-options.component.html',
    styleUrl: './master-options.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class MasterOptionsComponent implements OnInit {
    private apisService = inject(ApisService);
    private fb = inject(FormBuilder);

    masterOptions: any[] = [];
    isLoading = true;
    showModal = false;
    isEditMode = false;
    currentOptionId: string | null = null;

    optionForm: FormGroup = this.fb.group({
        group_name: ['', [Validators.required, Validators.minLength(2)]],
        group_name_eng: [''],
        isRequired: [false],
        isMultiple: [false],
        minChoices: [0],
        maxChoices: [0],
        choices: this.fb.array([])
    });

    get choices() {
        return this.optionForm.get('choices') as FormArray;
    }

    ngOnInit() {
        this.loadMasterOptions();
    }

    async loadMasterOptions() {
        this.isLoading = true;
        try {
            const res = await this.apisService.getGlobalMasterOptions();
            if (res.status === 200) {
                this.masterOptions = res.msg || [];
            }
        } catch (error) {
            console.error('Failed to load master options', error);
        } finally {
            this.isLoading = false;
        }
    }

    openAddModal() {
        this.isEditMode = false;
        this.currentOptionId = null;
        this.optionForm.reset({
            isRequired: false,
            isMultiple: false,
            minChoices: 0,
            maxChoices: 0
        });
        this.choices.clear();
        this.addChoice(); // Start with one choice
        this.showModal = true;
    }

    openEditModal(option: any) {
        this.isEditMode = true;
        this.currentOptionId = option.group_id;
        this.optionForm.patchValue({
            group_name: option.group_name,
            group_name_eng: option.group_name_eng,
            isRequired: option.isRequired,
            isMultiple: option.isMultiple,
            minChoices: option.minChoices,
            maxChoices: option.maxChoices
        });

        this.choices.clear();
        if (option.choices && option.choices.length > 0) {
            option.choices.forEach((choice: any) => {
                this.choices.push(this.fb.group({
                    options_name: [choice.options_name, Validators.required],
                    options_name_eng: [choice.options_name_eng],
                    options_price: [choice.options_price || 0],
                    options_active: [choice.options_active !== false]
                }));
            });
        } else {
            this.addChoice();
        }

        this.showModal = true;
    }

    addChoice() {
        this.choices.push(this.fb.group({
            options_name: ['', Validators.required],
            options_name_eng: [''],
            options_price: [0],
            options_active: [true]
        }));
    }

    removeChoice(index: number) {
        this.choices.removeAt(index);
    }

    async saveOption() {
        if (this.optionForm.invalid) return;

        const rawData = this.optionForm.getRawValue();
        const payload = {
            ...rawData,
            group_id: this.currentOptionId
        };

        try {
            let res;
            if (this.isEditMode) {
                res = await this.apisService.updateGlobalMasterOption(payload);
            } else {
                res = await this.apisService.createGlobalMasterOption(payload);
            }

            if (res.status === 200) {
                this.showModal = false;
                this.loadMasterOptions();
            } else {
                alert('Error: ' + res.msg);
            }
        } catch (error) {
            console.error('Failed to save master option', error);
            alert('System error occurred.');
        }
    }

    async deleteOption(id: string) {
        if (!confirm('Are you sure you want to delete this master option?')) return;

        try {
            const res = await this.apisService.deleteGlobalMasterOption(id);
            if (res.status === 200) {
                this.loadMasterOptions();
            } else {
                alert('Error: ' + res.msg);
            }
        } catch (error) {
            console.error('Failed to delete master option', error);
        }
    }

    closeModal() {
        this.showModal = false;
    }
}
