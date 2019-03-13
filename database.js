const mongoose = require('mongoose');
const fs = require('fs');
const axios = require('axios')
const logger = require('./logger');

const Article = require('./models/article');
const Project = require('./models/project');
const Tag = require('./models/tag');
const Image = require('./models/image');
const Company = require('./models/company');
const Colaborator = require('./models/colaborator');

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
    logger.info('MongoDB event connecting');
});

mongoose.connection.on('connected', function() {
    logger.info('MongoDB event connected');
});

mongoose.connection.on('disconnecting', function() {
    logger.info('MongoDB event disconnecting');
});

mongoose.connection.on('disconnected', function() {
    logger.info('MongoDB event disconnected');
});

mongoose.connection.on('reconnected', function() {
    logger.info('MongoDB event reconnected');
});

mongoose.connection.on('error', function(err) {
    logger.error('MongoDB event error: ' + err, err);
});

async function downloadImage(image) {
    let path = process.env.ROOT + '/public/assets/images/';

    if (!fs.existsSync(path))
        fs.mkdirSync(path);

    path += image._id.toString();

    const writer = fs.createWriteStream(path)

    const response = await axios({
        url: image.url,
        method: 'GET',
        responseType: 'stream'
    })

    response.data.pipe(writer)

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
    })
}

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

    ////////////
    // IMAGES //
    ////////////

    async getImage(url) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            const image = await Image.find({ url });

            if (!image)
                throw new Error(`Image with url ${name} not found.`);

            return `/assets/images/${picture._id}.png`;

        } catch (error) {
            throw error;
        }
    }

    async addImage(url) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            let image = await Image.findOne({ url });

            if (image) {
                const path = `${process.env.ROOT}/public/assets/images/${image._id}.png`;

                if (!fs.existsSync(path))
                    await downloadImage(image);

                return image;
            }

            image = new Image({ url });

            await downloadImage(image);

            return await image.save();
        } catch (error) {
            throw error;
        }
    }

    async removeImage(image) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            const anyProject = Project.findOne({ thumbnail: image });
            const anyArticle = Article.findOne({ $or: [{ 'thumbnail': image }, { 'background': image }] });
            const anyColaboratorLink = Colaborator.findOne({ 'links.image': image });

            if (!anyProject && !anyArticle && !anyColaboratorLink) {
                await Image.deleteOne({ url });
                const path = `${process.env.ROOT}/public/assets/images/${image._id}.png`;
                fs.unlinkSync(path);
            }

            return image;
        } catch (error) {
            throw error;
        }
    }

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

    async getArticles(find, sort, tag) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            const articles = await Article.find(find || {})
                .populate('tags')
                .populate('thumbnail')
                .populate('background')
                .sort(sort || { date: -1 });

            return tag ? articles.filter((article) => article.tags.map((tag) => tag.name).includes(tag)) : articles;
        } catch (error) {
            throw error;
        }
    }

    async getArticle(title) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            const article = await Article.findOne({ title }).populate('tags').populate('thumbnail').populate('background');

            if (!article)
                throw new Error(`Article ${title} not found.`);

            return article;
        } catch (error) {
            throw error;
        }
    }

    async postArticle(params) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            const title = params.title;

            let article = await Article.findOne({ title });

            if (article)
                throw new Error(`Article ${title} already exists.`);

            const tags = [];
            //Split by commas, trim all entries and remove duplicates.
            params.tags = params.tags ? [...new Set(params.tags.split(',').map(t => t.trim()))] : [];
            for (let i = 0; i < params.tags.length; i++) {
                const tag = await this.addTag(params.tags[i], 1);
                tags.push(tag);
            }

            const thumbnail = await this.addImage(params.thumbnail);

            const background = await this.addImage(params.background);

            const content = JSON.parse(params.content);

            article = new Article({
                title,
                tags,
                thumbnail,
                background,
                content
            });

            return await article.save();
        } catch (error) {
            throw error;
        }
    }

    async updateArticle(title, params) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            let article = await Article.findOne({ title }).populate('tags').populate('thumbnail').populate('background');

            if (!article)
                throw new Error(`Article ${title} does not exists.`);

            //Split by commas, trim all entries and remove duplicates.
            params.tags = params.tags ? [...new Set(params.tags.split(',').map(t => t.trim()))] : [];

            const tags = article.tags.filter((tag) => params.tags.includes(tag.name));

            const oldTags = article.tags.filter((tag) => !params.tags.includes(tag.name));
            for (let i = 0; i < oldTags.length; i++) {
                await this.removeTag(oldTags[i].name, 1);
            };

            const newTags = [];
            for (let i = 0; i < params.tags.length; i++) {
                const name = params.tags[i];

                let found = false;
                for (let j = 0; j < tags.length; j++) {
                    if (tags[j].name === name) {
                        found = true;
                        break;
                    }
                };

                if (!found) {
                    const tag = await this.addTag(name, 1);
                    newTags.push(tag);
                }
            }

            const lastThumbnail = article.thumbnail;
            let thumbnail = lastThumbnail;
            if (lastThumbnail.url !== params.thumbnail)
                thumbnail = await this.addImage(params.thumbnail);

            const lastBackground = article.background;
            let background = lastBackground
            if (lastBackground.url !== params.background)
                background = await this.addImage(params.background);

            article.title = params.title;
            article.tags = tags.concat(newTags);
            article.thumbnail = thumbnail;
            article.background = background;
            article.content = JSON.parse(params.content);

            await article.save();

            if (lastThumbnail !== thumbnail)
                await this.removeImage(lastThumbnail);

            if (lastBackground !== background)
                await this.removeImage(lastBackground);

            return article;

        } catch (error) {
            throw error;
        }
    }

    async deleteArticle(title) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            let article = await Article.findOne({ title }).populate('tags').populate('thumbnail').populate('background');

            if (!article)
                throw new Error(`Article ${title} does not exists.`);

            for (let i = 0; i < article.tags.length; i++) {
                await this.removeTag(article.tags[i].name, 1);
            };

            await Article.deleteOne({ title });

            await this.removeImage(article.thumbnail);

            await this.removeImage(article.background);

            return article;
        } catch (error) {
            throw error;
        }
    }

    ///////////////
    // COMPANIES //
    ///////////////

    async getCompanies(find, sort) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            return await Company.find(find || {}).populate('logo').sort(sort || { name: 1 });
        } catch (error) {
            throw error;
        }
    }

    async getCompany(name) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            const company = await Company.findOne({ name }).populate('logo');

            if (!company)
                throw new Error(`Company ${name} not found.`);

            return company;
        } catch (error) {
            throw error;
        }
    }

    async postCompany(params) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            const name = params.name;

            let company = await Company.findOne({ name });

            if (company)
                throw new Error(`Company ${name} already exists.`);

            const logo = await this.addImage(params.logo);

            company = new Company({
                name,
                logo,
                website: params.website
            });

            return await company.save();
        } catch (error) {
            throw error;
        }
    }

    async updateCompany(name, params) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            let company = await Company.findOne({ name }).populate('logo');

            if (!company)
                throw new Error(`Company ${name} does not exists.`);

            const lastLogo = company.logo;
            let logo = lastLogo;
            if (lastLogo.url !== params.logo)
                logo = await this.addImage(params.logo);

            company.name = params.name;
            company.logo = logo;
            company.website = params.website;

            await company.save();

            if (lastLogo !== logo)
                await this.removeImage(lastLogo);

            return company;
        } catch (error) {
            throw error;
        }
    }

    async deleteCompany(name) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            let company = await Company.findOne({ name }).populate('logo');

            if (!company)
                throw new Error(`Company ${name} does not exists.`);

            await Company.deleteOne({ name });

            await this.removeImage(company.logo);

            return company;
        } catch (error) {
            throw error;
        }
    }

    //////////////////
    // COLABORATORS //
    //////////////////

    async getColaborators(find, sort) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            return await Colaborator.find(find || {}).populate('links.image').sort(sort || { name: 1 });
        } catch (error) {
            throw error;
        }
    }

    async getColaborator(name) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            const colaborator = await Colaborator.findOne({ name }).populate('links.image');

            if (!colaborator)
                throw new Error(`Colaborator ${name} not found.`);

            return colaborator;
        } catch (error) {
            throw error;
        }
    }

    async postColaborator(params) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            const name = params.name;

            let colaborator = await Colaborator.findOne({ name });

            if (colaborator)
                throw new Error(`Colaborator ${name} already exists.`);

            const links = [];
            if (params.linkName) {
                if (Array.isArray(params.linkName)) {
                    for (let i = 0; i < params.linkName.length; i++) {
                        const image = await this.addImage(params.linkImage[i]);
                        links.push({
                            name: params.linkName[i],
                            url: params.linkUrl[i],
                            image
                        });
                    }
                } else {
                    const image = await this.addImage(params.linkImage);
                    links.push({
                        name: params.linkName,
                        url: params.linkUrl,
                        image
                    });
                }
            }

            colaborator = new Colaborator({
                name,
                links
            });

            return await colaborator.save();
        } catch (error) {
            throw error;
        }
    }

    async updateColaborator(name, params) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            let colaborator = await Colaborator.findOne({ name }).populate('links.image');

            if (!colaborator)
                throw new Error(`Colaborator ${name} does not exists.`);

            const links = [];
            if (params.linkName) {
                if (Array.isArray(params.linkName)) {
                    for (let i = 0; i < params.linkName.length; i++) {
                        const image = await this.addImage(params.linkImage[i]);
                        links.push({
                            name: params.linkName[i],
                            url: params.linkUrl[i],
                            image
                        });
                    }
                } else {
                    const image = await this.addImage(params.linkImage);
                    links.push({
                        name: params.linkName,
                        url: params.linkUrl,
                        image
                    });
                }
            }

            const oldLinks = colaborator.links.filter((link) => !links.map(l => l.image).includes(link.image));

            colaborator.name = params.name;
            colaborator.links = links;

            await colaborator.save();

            for (let i = 0; i < oldLinks.length; i++)
                await this.removeImage(oldLinks[i].image);

            return colaborator;
        } catch (error) {
            throw error;
        }
    }

    async deleteColaborator(name) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            let colaborator = await Colaborator.findOne({ name }).populate('links.image');

            if (!colaborator)
                throw new Error(`Colaborator ${name} does not exists.`);

            await Colaborator.deleteOne({ name });

            for (let i = 0; i < colaborator.links.length; i++)
                await removeImage(colaborator.links[i].image);

            return colaborator;
        } catch (error) {
            throw error;
        }
    }

    //////////////
    // PROJECTS //
    //////////////

    async getProjects(find, sort, tag) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            const projects = await Project.find(find || {})
                .populate('tags')
                .populate('thumbnail')
                .populate('company')
                .populate('colaborators.reference')
                .sort(sort || { date: 1 });

            return tag ? projects.filter((project) => project.tags.map((tag) => tag.name).includes(tag)) : projects;
        } catch (error) {
            throw error;
        }
    }

    async getProject(name) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            const project = await Project.findOne({ name })
                .populate('tags')
                .populate('thumbnail')
                .populate('company')
                .populate('colaborators.reference');

            if (!project)
                throw new Error(`Project ${name} does not exists.`);

            return project;
        } catch (error) {
            throw error;
        }
    }

    async postProject(params) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            const name = params.projectName;

            let project = await Project.findOne({ name });

            if (project)
                throw new Error(`Project ${name} already exists.`);

            let roles = [];
            if (params.role) {
                if (Array.isArray(params.role))
                    roles = params.role;
                else
                    roles.push(params.role);
            }

            const tags = [];
            //Split by commas, trim all entries and remove duplicates.
            params.tags = params.tags ? [...new Set(params.tags.split(',').map(t => t.trim()))] : [];
            for (let i = 0; i < params.tags.length; i++) {
                const tag = await this.addTag(params.tags[i], 2);
                tags.push(tag);
            };

            const company = await Company.findOne({ name: params.companyName });

            const getRoles = (index) => {
                let roles = [];
                const r = params[`colaboratorRole_${index}`];
                if (r) {
                    if (Array.isArray(r))
                        roles = r;
                    else
                        roles.push(r);
                }
                return roles;
            };

            const colaborators = [];
            if (params.colaboratorName) {
                if (Array.isArray(params.colaboratorName)) {
                    for (let i = 0; i < params.colaboratorName.length; i++) {
                        const reference = await Colaborator.findOne({ 'name': params.colaboratorName[i] });
                        const roles = getRoles(params.colaboratorIndex[i]);
                        colaborators.push({
                            reference,
                            roles
                        });
                    }
                } else {
                    const reference = await Colaborator.findOne({ 'name': params.colaboratorName });
                    const roles = getRoles(params.colaboratorIndex);
                    colaborators.push({
                        reference,
                        roles
                    });
                }
            }

            const links = [];
            if (params.linkName) {
                if (Array.isArray(params.linkName)) {
                    for (let i = 0; i < params.linkName.length; i++) {
                        links.push({
                            name: params.linkName[i],
                            url: params.linkUrl[i]
                        });
                    }
                } else links.push({
                    name: params.linkName,
                    url: params.linkUrl
                });
            }

            const thumbnail = await this.addImage(params.thumbnail);

            project = new Project({
                name,
                roles,
                date: new Date(params.date),
                tags,
                description: params.description,
                thumbnail,
                video: params.video,
                company,
                colaborators,
                links
            });

            return await project.save();
        } catch (error) {
            throw error;
        }
    }

    async updateProject(name, params) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            let project = await Project.findOne({ name })
                .populate('tags')
                .populate('thumbnail')
                .populate('company')
                .populate('colaborators.reference');

            if (!project)
                throw new Error(`Project ${name} does not exists.`);

            let roles = [];
            if (params.role) {
                if (Array.isArray(params.role))
                    roles = params.role;
                else
                    roles.push(params.role);
            }

            //Split by commas, trim all entries and remove duplicates.
            params.tags = params.tags ? [...new Set(params.tags.split(',').map(t => t.trim()))] : [];

            const tags = project.tags.filter((tag) => params.tags.includes(tag.name));

            const oldTags = project.tags.filter((tag) => !params.tags.includes(tag.name));
            for (let i = 0; i < oldTags.length; i++) {
                await this.removeTag(oldTags[i].name, 2);
            };

            const newTags = [];
            for (let i = 0; i < params.tags.length; i++) {
                const name = params.tags[i];

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
            }

            const company = await Company.findOne({ name: params.companyName });

            const getRoles = (index) => {
                let roles = [];
                const r = params[`colaboratorRole_${index}`];
                if (r) {
                    if (Array.isArray(r))
                        roles = r;
                    else
                        roles.push(r);
                }
                return roles;
            };

            const colaborators = [];
            if (params.colaboratorName) {
                if (Array.isArray(params.colaboratorName)) {
                    for (let i = 0; i < params.colaboratorName.length; i++) {
                        const reference = await Colaborator.findOne({ 'name': params.colaboratorName[i] });
                        const roles = getRoles(params.colaboratorIndex[i]);
                        colaborators.push({
                            reference,
                            roles
                        });
                    }
                } else {
                    const reference = await Colaborator.findOne({ 'name': params.colaboratorName });
                    const roles = getRoles(params.colaboratorIndex);
                    colaborators.push({
                        reference,
                        roles
                    });
                }
            }

            const links = [];
            if (params.linkName) {
                if (Array.isArray(params.linkName)) {
                    for (let i = 0; i < params.linkName.length; i++) {
                        links.push({
                            name: params.linkName[i],
                            url: params.linkUrl[i]
                        });
                    }
                } else links.push({
                    name: params.linkName,
                    url: params.linkUrl
                });
            }

            const lastThumbnail = project.thumbnail;
            let thumbnail = lastThumbnail;
            if (lastThumbnail.url !== params.thumbnail)
                thumbnail = await this.addImage(params.thumbnail);

            project.name = params.projectName;
            project.roles = roles;
            project.date = new Date(params.date);
            project.tags = tags.concat(newTags);
            project.description = params.description;
            project.thumbnail = thumbnail;
            project.video = params.video;
            project.company = company;
            project.colaborators = colaborators;
            project.links = links;

            await project.save();

            if (lastThumbnail !== thumbnail)
                await this.removeImage(lastThumbnail);

            return project;
        } catch (error) {
            throw error;
        }
    }

    async deleteProject(name) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            let project = await Project.findOne({ name }).populate('tags').populate('thumbnail');

            if (!project)
                throw new Error(`Project ${name} does not exists.`);

            for (let i = 0; i < projects.tags.length; i++) {
                await this.removeTag(projects.tags[i].name, 2);
            };

            await Project.deleteOne({ name });

            await this.removeImage(project.thumbnail);

            return project;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Database.instance;