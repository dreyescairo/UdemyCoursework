import { MakeService } from './../../services/make.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-vehicle-form',
  templateUrl: './vehicle-form.component.html',
  styleUrls: ['./vehicle-form.component.css']
})
export class VehicleFormComponent implements OnInit {


makes:any[];
models:any[];
vehicle:any = {}


  constructor(private MakeService: MakeService) { }

  ngOnInit() {
    this.MakeService.getMakes().subscribe(makes => this.makes = makes);

    
   
  }

onMakeChange(){
 var selectedMake = this.makes.find(m => m.id == this.vehicle.make);

 //if no make then set the model to an empty array so that the models dropdown is unpopulated.
 this.models = selectedMake ?  selectedMake.models : [];
}


}
