import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  showComment: boolean = false;
  storyList: any = [];
  allComments: any = [];
  filteredComments: any = [];
  allStory: any = [];
  periods = {
    month: 30 * 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    hour: 60 * 60 * 1000,
    minute: 60 * 1000
  };

  allStoriesUrl = 'http://hacker-news.firebaseio.com/v0/topstories.json?print=pretty';

  constructor(private http: HttpClient) {

  }

  ngOnInit() {
    this.fetchData();
  }

  //DESCRIBE:change time format
  formatTime(timeCreated: number) {
    const diff = Date.now() - timeCreated * 1000;
    if (diff > this.periods.month) {
      // it was at least a month ago
      return Math.floor(diff / this.periods.month) + " month ago";
    } else if (diff > this.periods.week) {
      return Math.floor(diff / this.periods.week) + " week ago";
    } else if (diff > this.periods.day) {
      return Math.floor(diff / this.periods.day) + " day ago";
    } else if (diff > this.periods.hour) {
      return Math.floor(diff / this.periods.hour) + " hour ago";
    } else if (diff > this.periods.minute) {
      return Math.floor(diff / this.periods.minute) + " minute ago";
    }
    return "Just now";
  }

//DESCRIBE: get url hostname
  getHostname = (url: string) => {
    return new URL(url).hostname;
  }

//DESCRIBE: filter comments base on parents
  filterComments(id: number) {
    this.showComment = true;
    this.allStory.map((items: any, index: 0) => {
      if (index === id) {
        const data: any = []
        this.filteredComments = this.allComments.filter((item: any) =>
          item.parent === items ? data.push(item.parent) : null)
      }
    })
  }

//DESCRIBE:fetch  top 5 Stories and top 3 comments of those stories
  private fetchData() {
    this.http.get(this.allStoriesUrl).subscribe((data: any) => {
      this.allStory = data.slice(0, 5)
      data.slice(0, 5).map((story: any) => {
        this.http.get<any>
          (`https://hacker-news.firebaseio.com/v0/item/${story}.json?print=pretty`).subscribe((stories: any) => {
            this.storyList.push({
              by: stories.by,
              kids: stories.kids ? stories.kids.slice(0, 3).map((item: any) => {
                this.http.get<any>
                  (`https://hacker-news.firebaseio.com/v0/item/${item}.json?print=pretty`).subscribe((comments: any) => {
                    this.allComments.push(comments)
                  })
              }) : [],
              title: stories.title,
              score: stories.score,
              time: this.formatTime(stories.time),
              url: stories.url ? this.getHostname(stories.url) : null
            })
          })
      })
    })
  }
}
