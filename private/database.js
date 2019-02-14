const mongoose = require('mongoose');

const Article = require(process.env.ROOT + '/private/models/article');
const Project = require(process.env.ROOT + '/private/models/project');
const Tag = require(process.env.ROOT + '/private/models/tag');

//mongoose.Promise = Promise;

const connection_string = `mongodb://${process.env.MONGO_IP}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`;

const connection_options = (user) => {
    if (user)
        return {
            user: process.env.MONGO_USER,
            pass: process.env.MONGO_PASS,
            useNewUrlParser: true
        };

    return { useNewUrlParser: true };
};

mongoose.connection.on('connecting', function() {
    console.log('MongoDB event connecting');
});

mongoose.connection.on('connected', function() {
    console.log('MongoDB event connected');
});

mongoose.connection.on('disconnecting', function() {
    console.log('MongoDB event disconnecting');
});

mongoose.connection.on('disconnected', function() {
    console.log('MongoDB event disconnected');
});

mongoose.connection.on('reconnected', function() {
    console.log('MongoDB event reconnected');
});

mongoose.connection.on('error', function(err) {
    console.err('MongoDB event error: ' + err);
});

let database;

class Database {

    constructor() {}
    static get instance() {
        if (database === undefined)
            database = new Database();

        return database;
    }

    get isDisconnected() { return mongoose.connection.readyState === 0; }
    get isConnected() { return mongoose.connection.readyState === 1; }
    get isConnecting() { return mongoose.connection.readyState === 2; }
    get isDisconnecting() { return mongoose.connection.readyState === 3; }
    get state() {
        const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
        return states[mongoose.connection.readyState];
    }

    connect() {
        mongoose.set('useCreateIndex', true)
        return mongoose.connect(connection_string, connection_options(true));
    }

    disconnect() { return mongoose.connection.close(); }

    //////////
    // TAGS //
    //////////

    async getTags(find, sort) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            return await Tag.find(find || {}).sort(sort || { name: -1 });

        } catch (error) {
            throw error;
        }
    }

    async addTag(name, type) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            let tag = await Tag.findOne({ name });

            if (!tag)
                tag = new Tag({ name });

            switch (type) {
                case 1:
                    tag.articleEntries++;
                    break;

                case 2:
                    tag.projectEntries++;
                    break;

                default:
                    throw new Error(`Add Tag ${name} with invalid type (${type})`);
            }

            return await tag.save();
        } catch (error) {
            throw error;
        }
    }

    async removeTag(name, type) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            const tag = await Tag.findOne({ name });

            if (!tag)
                throw new Error(`Tag ${name} not found.`);

            switch (type) {
                case 1:
                    tag.articleEntries--;
                    break;

                case 2:
                    tag.projectEntries--;
                    break;

                default:
                    throw new Error(`Remove Tag ${name} with invalid type (${type})`);
            }

            if (tag.articleEntries < 1 && tag.projectEntries < 1) {
                return await Tag.deleteOne({ name });
            }

            return await tag.save();
        } catch (error) {
            throw error;
        }
    }

    //////////////
    // ARTICLES //
    //////////////

    async getArticles(find, sort) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            return await Article.find(find || {}).sort(sort || { date: -1 });
        } catch (error) {
            throw error;
        }
    }

    async getArticle(title) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            const article = await Article.findOne({ title });

            if (!article)
                throw new Error(`Article ${title} not found.`);

            return article;
        } catch (error) {
            throw error;
        }
    }

    async postArticle(title, tagString, thumbnail, background, rawContent) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            let article = await Article.findOne({ title });

            if (article)
                throw new Error(`Article ${title} already exists.`);

            const tags = [];
            //Split by commas, trim all entries and remove duplicates.
            tagString = [...new Set(tagString.split(',').map(t => t.trim()))];
            for (let i = 0; i < tagString.length; i++) {
                const tag = await this.addTag(tagString[i], 1);
                tags.push(tag);
            }

            article = new Article({
                title,
                tags,
                thumbnail,
                background,
                content: JSON.parse(rawContent)
            });

            return await article.save();
        } catch (error) {
            throw error;
        }
    }

    async updateArticle(title, newtitle, tagString, thumbnail, background, rawContent) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            let article = Article.findOne({ title });

            if (!article)
                throw new Error(`Article ${title} does not exists.`);

            //Split by commas, trim all entries and remove duplicates.
            tagString = [...new Set(tagString.split(',').map(t => t.trim()))];

            const tags = article.tags.filter((tag) => tagString.includes(tag.name));

            const oldTags = article.tags.filter((tag) => !tagString.includes(tag.name));
            for (let i = 0; i < oldTags.length; i++) {
                await this.removeTag(oldTags[i].name, 1);
            };

            const newTags = [];
            for (let i = 0; i < tagString.length; i++) {
                const name = tagString[i];

                let found = false;
                tags.forEach((tag) => {
                    if (tag.name === name) {
                        found = true;
                        break;
                    }
                });

                if (!found) {
                    const tag = await this.addTag(name, 1);
                    newTags.push(tag);
                }
            }

            article.title = newtitle;
            article.tags = tags.concat(newTags);
            article.thumbnail = thumbnail;
            article.background = background;
            article.content = JSON.parse(rawContent);

            return await article.save();
        } catch (error) {
            throw error;
        }
    }

    async deleteArticle(title) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            let article = Article.findOne({ title });

            if (!article)
                throw new Error(`Article ${title} does not exists.`);

            for (let i = 0; i < article.tags.length; i++) {
                await this.removeTag(article.tags[i].name);
            };

            return await article.deleteOne({ title });
        } catch (error) {
            throw error;
        }
    }

    //////////////
    // PROJECTS //
    //////////////

    async getProjects(find, sort) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            return await Project.find(find || {}).sort(sort || { date: 1 });
        } catch (error) {
            throw error;
        }
    }

    async getProject(name) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            const project = await Project.findOne({ name });

            if (!project)
                throw new Error(`Project ${name} does not exists.`);

            return project;
        } catch (error) {
            throw error;
        }
    }

    async postProject(name, position, dateString, tagString, description, thumbnail, video) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            let project = await Project.findOne({ name });

            if (project)
                throw new Error(`Project ${name} already exists.`);

            const date = new Date(dateString);

            const tags = [];
            //Split by commas, trim all entries and remove duplicates.
            tagString = [...new Set(tagString.split(',').map(t => t.trim()))];
            for (let i = 0; i < tagString.length; i++) {
                const tag = await this.addTag(tagString[i], 2);
                tags.push(tag);
            };

            project = new Project({
                name,
                position,
                date,
                tags,
                description,
                thumbnail,
                video
            });

            return await project.save();
        } catch (error) {
            throw error;
        }
    }

    async updateProject(name, newName, position, dateString, tagString, description, thumbnailLink, videoLink) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            let project = await Project.findOne({ name });

            if (!project)
                throw new Error(`Project ${name} does not exists.`);

            //Split by commas, trim all entries and remove duplicates.
            tagString = [...new Set(tagString.split(',').map(t => t.trim()))];

            const tags = project.tags.filter((tag) => tagString.includes(tag.name));

            const oldTags = project.tags.filter((tag) => !tagString.includes(tag.name));
            for (let i = 0; i < oldTags.length; i++) {
                await this.removeTag(oldTags[i].name, 1);
            };

            const newTags = [];
            for (let i = 0; i < newTags.length; i++) {
                const name = newTags[i];

                let found = false;
                for (let j = 0; j < tags.length; j++) {
                    if (tags[j].name === name) {
                        found = true;
                        break;
                    }
                };

                if (!found) {
                    const tag = await this.addTag(name, 2);
                    newTags.push(tag);
                }
            };

            project.name = newName;
            project.position = position;
            project.date = dateString;
            project.tags = tags.concat(newTags);
            project.description = description;
            project.thumbnail = thumbnailLink;
            project.video = videoLink;

            return await project.save();
        } catch (error) {
            throw error;
        }
    }

    async deleteProject(name) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            let project = Project.findOne({ name });

            if (!project)
                throw new Error(`Project ${name} does not exists.`);

            for (let i = 0; i < projects.tags.length; i++) {
                await this.removeTag(projects.tags[i].name, 2);
            };

            return await project.deleteOne({ name });
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Database.instance;