import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BoardSummaryComponent } from './board-summary.component';

describe('AppBoardSummaryComponent', () => {
  let component: BoardSummaryComponent;
  let fixture: ComponentFixture<BoardSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoardSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
