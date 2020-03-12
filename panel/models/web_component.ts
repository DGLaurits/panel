import { HTMLBox, HTMLBoxView } from "@bokehjs/models/layouts/html_box"

// import { div } from "core/dom"
import * as p from "@bokehjs/core/properties"


// Todo: Remove console.log
// Reight now they are helpfull
export class WebComponentView extends HTMLBoxView {
    model: WebComponent
    webComponentElement: any // Element
    eventsCount: any // Dict
    propertyValues: any // Dict

    initialize(): void {
        console.log("initialize")
        super.initialize()
        console.log("initialize - DONE")
    }

    connect_signals(): void {
        console.log("connect signals")
        super.connect_signals()
        this.connect(this.model.properties.innerHTML.change, () => this.render())
        this.connect(this.model.properties.propertiesLastChange.change, () => this.handlePropertiesLastChangeChange())
        this.connect(this.model.properties.eventsToWatch.change, () => this.handleEventsToWatchChange())
        this.connect(this.model.properties.columnDataSource.change, () => this.handleColumnDataSourceChange())
        console.log("connect signals - DONE")
    }

    render(): void {
        console.log("render")
        super.render()

        if (this.el.innerHTML !== this.model.innerHTML) {
            let webComponentElementOld: any = null
            if (this.webComponentElement) {
                this.webComponentElement.onchange = null;
                webComponentElementOld = this.webComponentElement;
            }
            this.el.innerHTML = this.model.innerHTML; // Todo: Remove
            this.webComponentElement = this.el.firstElementChild;
            console.log(this.webComponentElement);
            console.log(this.model);
            this.initPropertyValues();
            if (!webComponentElementOld) {
                // initializes to the correct properties on first construction
                this.handlePropertiesLastChangeChange();
            }

            this.webComponentElement.onchange = (ev: any) => this.handlePropertiesChange(ev);
            this.addEventListeners();
            this.addMutationObserver();
            this.activate_scripts(this.webComponentElement.parentNode);
            this.handleColumnDataSourceChange();
        }
        console.log("render - DONE")
    }
    addMutationObserver(): void {
        let options = {
            childList: false,
            attributes: true,
            characterData: false,
            subtree: false,
            attributeFilter: Object.keys(this.model.attributesToWatch),
            attributeOldValue: false,
            characterDataOldValue: false
        };
        console.log(options);

        const this_ = this;
        function mutationEventHandler(mutation: any): void {
            console.log("mutation")
            console.log(mutation)

            const newHTML = mutation[mutation.length - 1].target.parentElement.innerHTML;
            if (newHTML !== this_.model.innerHTML) {
                console.log(newHTML)
                // this_.model.innerHTML = newHTML;
            }
        }

        let observer = new MutationObserver(mutationEventHandler);
        // hack
        observer.observe(this.webComponentElement, options)
    }


    private addEventListeners() {
        this.eventsCount = {}
        for (let event in this.model.eventsToWatch) {
            this.eventsCount[event] = 0
            this.webComponentElement.addEventListener(event, (ev: Event) => this.eventHandler(ev), false)
        }
    }

    transform_cds_to_records(cds: any): any {
        const data: any = []
        const columns = cds.columns()

        if (columns.length === 0) {
            return [];
        }
        for (let i = 0; i < cds.data[columns[0]].length; i++) {
            const item: any = {}
            for (const column of columns) {
                const shape = cds._shapes[column]
                if ((shape !== undefined) && (shape.length > 1) && (typeof shape[0] == "number"))
                    item[column] = cds.data[column].slice(i * shape[1], i * shape[1] + shape[1])
                else
                    item[column] = cds.data[column][i]
            }
            data.push(item)
        }
        return data
    }

    // https://stackoverflow.com/questions/5999998/check-if-a-variable-is-of-function-type
    isFunction(functionToCheck: any) {
        if (functionToCheck) {
            const stringName = {}.toString.call(functionToCheck);
            return stringName === '[object Function]' || stringName === '[object AsyncFunction]';
        } else { return false }
    }

    handleColumnDataSourceChange(): void {
        console.log("handledataChange");
        console.log(this.model.columnDataSource);
        if (this.model.columnDataSource) {
            console.log(this.model.columnDataSource)
            let data: any // list
            const columnDataSourceOrient: any = this.model.columnDataSourceOrient;
            if (columnDataSourceOrient === "records") {
                data = this.transform_cds_to_records(this.model.columnDataSource);
            } else {
                // Todo: Solve lint problem
                // @ts-ignore
                data = this.model.columnDataSource.data;
            }
            const loadFunctionName: string = this.model.columnDataSourceLoadFunction.toString();
            const loadFunction = this.webComponentElement[loadFunctionName]
            if (this.isFunction(loadFunction)) {
                this.webComponentElement[loadFunctionName](data)
            } else {
                this.webComponentElement[loadFunctionName] = data
            }

        }
        // Todo: handle situation where this.model.columnDataSource is null
    }

    /**
     * Activates or reruns all script tags in the element
     * @param el An element containing script tags
     */
    private activate_scripts(el: Element) {
        Array.from(el.querySelectorAll("script")).forEach((oldScript: Element) => {
            const newScript = document.createElement("script")
            Array.from(oldScript.attributes)
                .forEach(attr => newScript.setAttribute(attr.name, attr.value))
            newScript.appendChild(document.createTextNode(oldScript.innerHTML))
            if (oldScript.parentNode) {
                oldScript.parentNode.replaceChild(newScript, oldScript)
            }
        })
    }

    // See https://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key
    // example: reverse(element, "textInput.value") would return element.textInput.value
    get_nested_property(element: any, property_: string): string {
        property_ = property_.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        property_ = property_.replace(/^\./, '');           // strip a leading dot
        let a = property_.split('.');
        for (let i = 0, n = a.length; i < n; ++i) {
            let k = a[i];
            if (k in element) {
                element = element[k];
            } else {
                return "";
            }
        }
        return element;
    }

    set_nested_property(element: any, property_: string, value: any): void {
        property_ = property_.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        property_ = property_.replace(/^\./, '');           // strip a leading dot
        let a = property_.split('.');
        for (let i = 0, n = a.length; i < n; ++i) {
            let k = a[i];
            if (k in element) {
                element[k] = value;
            } else {
                return;
            }
        }
    }

    handleEventsToWatchChange(): void {
        // Todo: Implement this
        // First old eventlisteners should be removed
        // Then the new should be added
        // This should be used in the render section

        // console.log("handleEventsToWatchChange")
        // for (let event in this.model.eventsToWatch) {
        //     this.webComponentElement.addEventListener(event, () => { console.log(this.webComponentElement) }, false)
        // }
    }

    // Todo: Find out if onchange and event listeners should be removed "on destroy"

    // Todo: Set this up
    // handle_innerHTML_change(ev: any): void {
    //     if (this.model.innerHTML !== this.webComponentElement.outerHTML) {
    //         this.model.innerHTML = this.webComponentElement.outerHTML;
    //     }
    // }
    eventHandler(ev: Event): void {
        console.log("eventHandler")
        console.log(ev);
        let event = ev.type;
        this.eventsCount[event] += 1;
        let eventsCountLastChanged: any = {};
        eventsCountLastChanged[event] = this.eventsCount[event]
        this.model.eventsCountLastChange = eventsCountLastChanged;

        this.checkIfPropertiesChanged()
        console.log("eventHandler - Done")
    }

    checkIfPropertiesChanged(): void {
        console.log("checkIfPropertiesChanged")
        let propertiesChange: any = {};
        for (let property in this.model.propertiesToWatch) {
            let oldValue: any = this.propertyValues[property];
            let newValue: any = this.get_nested_property(this.webComponentElement, property);
            if (oldValue != newValue) {
                propertiesChange[property] = newValue;
                this.propertyValues[property] = newValue;
            }
        }
        if (Object.keys(propertiesChange).length) {
            this.model.propertiesLastChange = propertiesChange;
        }
        console.log(this.propertyValues);
        console.log("checkIfPropertiesChanged - Done")
    }

    handlePropertiesChange(ev: any): void {
        console.log("handlePropertiesChange")
        let properties_change: any = new Object();
        for (let property in this.model.propertiesToWatch) {
            if (property in ev.detail) {
                properties_change[property] = ev.detail[property];
                this.propertyValues[property] = ev.detail[property];
            }
        }
        if (Object.keys(properties_change).length) {
            this.model.propertiesLastChange = properties_change;
        }
        console.log(properties_change)
        console.log("handlePropertiesChange - Done")
    }

    initPropertyValues(): void {
        console.log("initPropertyValues");
        this.propertyValues = new Object();
        if (!this.webComponentElement) { return; }

        for (let property in this.model.propertiesToWatch) {
            let old_value = this.propertyValues[property];
            let new_value = this.get_nested_property(this.webComponentElement, property);
            if (new_value !== old_value) {
                this.propertyValues[property] = new_value;
            }
        }
        console.log(this.propertyValues);
        console.log("initPropertyValues - DONE");
    }

    handlePropertiesLastChangeChange(): void {
        console.log("handlePropertiesLastChangeChange")
        if (!this.webComponentElement) { return; }

        console.log(this.model.propertiesLastChange);
        let propertiesLastChange: any = this.model.propertiesLastChange;
        for (let property in this.model.propertiesLastChange) {
            if (property in this.model.propertiesToWatch) {
                let value = propertiesLastChange[property]
                this.set_nested_property(this.webComponentElement, property, value);
            }
        }
        console.log("handlePropertiesLastChangeChange - done")
    }
}

export namespace WebComponent {
    export type Attrs = p.AttrsOf<Props>
    // Todo: make property types more specific
    export type Props = HTMLBox.Props & {
        // Todo: should we just use object instead of innerHTML?
        // Just like for the HTML element
        innerHTML: p.Property<string>,
        attributesToWatch: p.Property<any> // A dictionary
        propertiesToWatch: p.Property<p.Any>, // A dictionary
        propertiesLastChange: p.Property<p.Any>, // A dictionary
        eventsToWatch: p.Property<p.Any> // A dictionary
        eventsCountLastChange: p.Property<p.Any> // A Dictionary
        columnDataSource: p.Property<p.Any> // A ColumnDataSource
        columnDataSourceOrient: p.Property<p.String>
        columnDataSourceLoadFunction: p.Property<p.String>
    }
}

export interface WebComponent extends WebComponent.Attrs { }

export class WebComponent extends HTMLBox {
    properties: WebComponent.Props

    constructor(attrs?: Partial<WebComponent.Attrs>) {
        super(attrs)
    }

    static __module__ = "panel.models.web_component"

    static init_WebComponent(): void {
        this.prototype.default_view = WebComponentView;

        this.define<WebComponent.Props>({
            innerHTML: [p.String, ''],
            attributesToWatch: [p.Any], // A dictionary
            propertiesToWatch: [p.Any], // A dictionary
            propertiesLastChange: [p.Any], // A dictionary
            eventsToWatch: [p.Any], // A dictionary
            eventsCountLastChange: [p.Any], // A list
            columnDataSource: [p.Any], // A ColumnDataSource
            columnDataSourceOrient: [p.Any], // A string
            columnDataSourceLoadFunction: [p.Any], // A string
        })
    }
}