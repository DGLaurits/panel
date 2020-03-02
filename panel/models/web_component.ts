import { HTMLBox, HTMLBoxView } from "@bokehjs/models/layouts/html_box"

// import { div } from "core/dom"
import * as p from "@bokehjs/core/properties"

export class WebComponentView extends HTMLBoxView {
    model: WebComponent
    webComponentElement: any

    initialize(): void {
        super.initialize()
    }

    connect_signals(): void {
        super.connect_signals()
        this.connect(this.model.properties.innerHTML.change, () => this.render())
        this.connect(this.model.properties.propertiesLastChange.change, () => this.handlePropertiesLastChangeChange())
    }

    render(): void {
        super.render()

        if (this.el.innerHTML !== this.model.innerHTML) {
            if (this.webComponentElement) {
                this.webComponentElement.onchange = null;
            }
            this.el.innerHTML = this.model.innerHTML; // Todo: Remove
            this.webComponentElement = this.el.firstElementChild;

            // Since far from all web components change the attribute when the corresponding property is changed
            // we need to watch the properties and not the attributes
            // An example is wired-radio from https://www.npmjs.com/package/wired-radio
            // When we click that, the checked property is changed but not the checked attribute
            this.webComponentElement.onchange = (ev: any) => this.handlePropertiesChange(ev);
        }
    }

    // handle_innerHTML_change(ev: any): void {
    //     if (this.model.innerHTML !== this.webComponentElement.outerHTML) {
    //         this.model.innerHTML = this.webComponentElement.outerHTML;
    //     }
    // }


    handlePropertiesChange(ev: any): void {
        // Todo: remove logging
        console.log(ev);
        var properties_change: any = new Object();
        for (let property in this.model.propertiesToWatch) {
            if (property in ev.detail) {
                properties_change[property] = ev.detail[property];
            }
        }
        if (Object.keys(properties_change).length) {
            this.model.propertiesLastChange = properties_change;
        }
    }

    handlePropertiesLastChangeChange(): void {
        if (!this.webComponentElement) { return; }

        var propertiesLastChange: any = this.model.propertiesLastChange;
        for (let property in this.model.propertiesLastChange) {
            if (property in this.model.propertiesToWatch) {
                var value = propertiesLastChange[property]
                this.webComponentElement[property] = value;
            }
        }

    }
}

export namespace WebComponent {
    export type Attrs = p.AttrsOf<Props>
    export type Props = HTMLBox.Props & {
        innerHTML: p.Property<string>,
        attributesToWatch: p.Property<any> // A dictionary
        propertiesToWatch: p.Property<p.Any>, // A dictionary
        propertiesLastChange: p.Property<p.Any>, // A dictionary
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
        })
    }
}
